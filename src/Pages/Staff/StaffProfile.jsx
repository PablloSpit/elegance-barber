import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStaff } from '../../Context/StaffContext'
import { useAuth } from '../../Context/AuthContext'
import { useMessage } from '../../Context/MessageContext'
import {
    Save,
    User,
    Mail,
    Phone,
    Briefcase,
    Scissors,
    Clock,
    Lock
} from 'lucide-react'

function StaffProfile() {
    const { t } = useTranslation()
    const { getStaffById, updateStaff } = useStaff()
    const { currentUser } = useAuth()
    const { showMessage } = useMessage()

    const [isLoading, setIsLoading] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialties: '',
        experience: '',
        weekdayStart: '',
        weekdayEnd: '',
        saturdayStart: '',
        saturdayEnd: '',
        sundayStart: '',
        sundayEnd: '',
        sundayEnabled: false,
        schedule: {}
    })

    useEffect(() => {
        if (!currentUser) return;

        const staffData = getStaffById(currentUser.id)
        if (staffData) {
            const schedule = staffData.schedule || {};
            const monday = schedule.monday || { start: "09:00", end: "17:00" };
            const saturday = schedule.saturday || { start: "10:00", end: "16:00" };
            const sunday = schedule.sunday || null;

            setFormData({
                name: staffData.name || '',
                email: staffData.email || '',
                phone: staffData.phone || '',
                specialties: Array.isArray(staffData.specialties)
                    ? staffData.specialties.join(', ')
                    : (staffData.specialties || ''),
                experience: staffData.experience || '',

                weekdayStart: monday.start,
                weekdayEnd: monday.end,
                saturdayStart: saturday.start,
                saturdayEnd: saturday.end,

                sundayEnabled: !!sunday,
                sundayStart: sunday ? sunday.start : '',
                sundayEnd: sunday ? sunday.end : '',

                schedule: schedule
            })
        }
    }, [currentUser, getStaffById])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.name || !formData.email || !formData.phone) {
            showMessage('error', t('admin.fill_all_fields'))
            setIsLoading(false);
            return;
        }

        const updatedSchedule = { ...formData.schedule };

        if (formData.weekdayStart && formData.weekdayEnd) {
            const weekdayTime = { start: formData.weekdayStart, end: formData.weekdayEnd };
            updatedSchedule.monday = weekdayTime;
            updatedSchedule.tuesday = weekdayTime;
            updatedSchedule.wednesday = weekdayTime;
            updatedSchedule.thursday = weekdayTime;
            updatedSchedule.friday = weekdayTime;
        }

        if (formData.saturdayStart && formData.saturdayEnd) {
            updatedSchedule.saturday = { start: formData.saturdayStart, end: formData.saturdayEnd };
        }

        if (formData.sundayEnabled && formData.sundayStart && formData.sundayEnd) {
            updatedSchedule.sunday = { start: formData.sundayStart, end: formData.sundayEnd };
        } else if (!formData.sundayEnabled) {
            updatedSchedule.sunday = null;
        }

        const shouldChangePassword = passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword

        if (shouldChangePassword) {
            if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                showMessage('error', t('admin.fill_password_fields'))
                setIsLoading(false)
                return
            }
            if (passwordData.currentPassword !== currentUser?.password) {
                showMessage('error', t('admin.incorrect_current_password'))
                setIsLoading(false)
                return
            }
            if (passwordData.newPassword.length < 6) {
                showMessage('error', t('admin.password_min_length'))
                setIsLoading(false)
                return
            }
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showMessage('error', t('admin.password_mismatch'))
                setIsLoading(false)
                return
            }
        }

        const updatedStaffData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
            experience: formData.experience,
            schedule: updatedSchedule
        };

        if (shouldChangePassword) {
            updatedStaffData.password = passwordData.newPassword
        }

        const result = await updateStaff(currentUser.id, updatedStaffData);
        setIsLoading(false);

        if (result?.error) {
            showMessage('error', result.error);
        } else {
            showMessage('success', t('profile.profile_updated_success'))

            if (shouldChangePassword) {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            }

            const event = new CustomEvent('staff-profile-updated', {
                detail: { ...updatedStaffData, id: currentUser.id }
            });
            window.dispatchEvent(event);
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-4 sm:py-0">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {t('nav.my_profile').split(' ')[0]} <span className="text-champberry">{t('nav.my_profile').split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('profile.manage_profile_subtitle')}</p>
            </div>

            {/* Unique Booking Link Card */}
            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-champberry/10 rounded-xl text-champberry">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">{t('admin.copy_booking_link', 'Link de Agendamento Personalizado')}</h2>
                            <p className="text-gray-400 text-xs mt-1">{t('profile.booking_link_desc', 'Use este link para receber agendamentos diretamente para você.')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/?staff=${currentUser.id}#appointment`;
                            navigator.clipboard.writeText(url);
                            showMessage('success', t('admin.booking_link_copied', 'Link de agendamento copiado!'));
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-champberry hover:bg-champberry-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                        {t('common.copy_link', 'Copiar Link')}
                    </button>
                </div>
            </div>

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                        {/* Personal Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <User className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('admin.personal_info')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.full_name')} *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full pl-10 p-3 outline-none transition-all placeholder-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">E-mail *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full pl-10 p-3 outline-none transition-all placeholder-gray-700"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-champberry-muted ml-1">{t('profile.contact_admin_email')}</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.phone_number')} *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full pl-10 p-3 outline-none transition-all placeholder-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <Briefcase className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('admin.professional_info')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.experience_years')}</label>
                                    <select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="1 ano">1 ano</option>
                                        <option value="2 anos">2 anos</option>
                                        <option value="3 anos">3 anos</option>
                                        <option value="4 anos">4 anos</option>
                                        <option value="5 anos">5 anos</option>
                                        <option value="7 anos">7 anos</option>
                                        <option value="10+ anos">10+ anos</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Especialidades</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted">
                                            <Scissors size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="specialties"
                                            value={formData.specialties}
                                            onChange={handleChange}
                                            placeholder={t('admin.specialties_placeholder')}
                                            className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full pl-10 p-3 outline-none transition-all placeholder-gray-700"
                                        />
                                    </div>
                                    <p className="text-xs text-champberry-muted ml-1">Separado por vírgula. Ex: Corte, Barba, Coloração</p>
                                </div>
                            </div>
                        </div>

                        {/* Availability Configuration */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <Clock className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('profile.availability')}</h2>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-400">{t('profile.update_availability_desc')}</p>

                            <div className="bg-obsidian-surface p-3 sm:p-4 md:p-6 rounded-xl border border-white/5 space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white">{t('profile.weekdays')}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.start_time')}</label>
                                                <input
                                                    type="time"
                                                    name="weekdayStart"
                                                    value={formData.weekdayStart}
                                                    onChange={handleChange}
                                                    className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.end_time')}</label>
                                                <input
                                                    type="time"
                                                    name="weekdayEnd"
                                                    value={formData.weekdayEnd}
                                                    onChange={handleChange}
                                                    className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white">{t('profile.saturday')}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.start_time')}</label>
                                                <input
                                                    type="time"
                                                    name="saturdayStart"
                                                    value={formData.saturdayStart}
                                                    onChange={handleChange}
                                                    className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.end_time')}</label>
                                                <input
                                                    type="time"
                                                    name="saturdayEnd"
                                                    value={formData.saturdayEnd}
                                                    onChange={handleChange}
                                                    className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white">{t('profile.sunday')}</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="sundayEnabled"
                                                    checked={formData.sundayEnabled}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-champberry"></div>
                                                <span className="ml-3 text-xs font-medium text-gray-400">{t('profile.available_on_sundays')}</span>
                                            </label>
                                        </div>

                                        {formData.sundayEnabled && (
                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-1.5">
                                                    <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.start_time')}</label>
                                                    <input
                                                        type="time"
                                                        name="sundayStart"
                                                        value={formData.sundayStart}
                                                        onChange={handleChange}
                                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-champberry-muted text-[11px] font-semibold uppercase ml-1">{t('profile.end_time')}</label>
                                                    <input
                                                        type="time"
                                                        name="sundayEnd"
                                                        value={formData.sundayEnd}
                                                        onChange={handleChange}
                                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-2.5 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Configuration */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <Lock className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('admin.security')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.current_password')}</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder={t('admin.enter_current_password')}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.new_password')}</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder={t('admin.enter_new_password')}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.confirm_password')}</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder={t('admin.confirm_new_password')}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-champberry hover:bg-champberry-dark text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-xl hover:shadow-champberry/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Save size={18} />
                                {isLoading ? t('common.loading') : t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default StaffProfile