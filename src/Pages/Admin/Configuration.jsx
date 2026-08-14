import { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import { useMessage } from '../../Context/MessageContext'
import { Save, User, Mail, Phone, Clock, Calendar, Bell, Globe } from 'lucide-react'

function Configuration() {
    const { currentUser, updatedUser } = useAuth()
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
        phone: ''
    })

    useEffect(() => {
        if (!currentUser) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || ''
        })
    }, [currentUser])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) return

        if (!formData.name || !formData.phone) {
            showMessage('error', t('admin.fill_all_fields', 'Por favor, preencha todos os campos obrigatórios'))
            return
        }

        const shouldChangePassword = passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword

        if (shouldChangePassword) {
            if (!passwordData.currentPassword || !passwordData.newPassword) {
                showMessage('error', t('admin.fill_password_fields', 'Por favor, preencha os campos de senha'))
                return
            }
            if (passwordData.currentPassword !== currentUser?.password) {
                showMessage('error', t('admin.incorrect_current_password', 'Senha atual incorreta'))
                return
            }
            if (passwordData.newPassword.length < 6) {
                showMessage('error', t('admin.password_min_length', 'A nova senha deve ter pelo menos 6 caracteres'))
                return
            }
        }

        setIsLoading(true)
        const updated = {
            ...currentUser,
            name: formData.name,
            phone: formData.phone
        }

        if (shouldChangePassword) {
            updated.password = passwordData.newPassword
        }

        const result = await updatedUser(updated)
        setIsLoading(true)
        
        setTimeout(() => {
            setIsLoading(false)
            if (result?.success) {
                showMessage('success', t('common.success_update', 'Configurações atualizadas com sucesso!'))
                if (shouldChangePassword) {
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }
            } else {
                showMessage('error', result?.error || t('common.error_update', 'Falha ao atualizar configurações'))
            }
        }, 1000)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-0">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {t('nav.account')} e <span className="text-champberry">Configurações</span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Gerencie as informações da sua barbearia e regras de negócio</p>
            </div>

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">


                <div className="p-4 sm:p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <User className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('admin.personal_details', 'Informações Pessoais')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.full_name', 'Nome Completo')} *</label>
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
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Email *</label>
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
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-gray-400 text-xs font-bold uppercase ml-1">{t('admin.phone_number', 'Telefone')} *</label>
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

                        {/* Business Rules Section */}
                        <div className="space-y-6 pt-6 border-t border-[#333]">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <Globe className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">Regras de Negócio</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Modo Feriado</label>
                                    <div className="flex items-center gap-4 bg-obsidian-elevated p-3 rounded-lg border border-[#333]">
                                        <Calendar className="text-champberry-muted" size={20} />
                                        <div className="flex-1">
                                        <p className="text-xs text-white font-bold uppercase">{t('admin.holiday_mode', 'Modo Feriado')}</p>
                                        <p className="text-[10px] text-gray-500">{t('admin.holiday_mode_desc', 'Bloqueia todos os agendamentos no período selecionado')}</p>
                                        </div>
                                        <input type="checkbox" className="w-5 h-5 accent-champberry cursor-pointer" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Notificações</label>
                                    <div className="flex items-center gap-4 bg-obsidian-elevated p-3 rounded-lg border border-[#333]">
                                        <Bell className="text-champberry-muted" size={20} />
                                        <div className="flex-1">
                                        <p className="text-xs text-white font-bold uppercase">{t('admin.alert_sounds', 'Sons de Alerta')}</p>
                                        <p className="text-[10px] text-gray-500">{t('admin.alert_sounds_desc', 'Reproduz som ao receber novos agendamentos')}</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-champberry cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 sm:gap-3 border-b border-[#333] pb-3">
                                <Clock className="text-champberry" size={18} />
                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wider">{t('profile.security', 'Segurança')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Senha Atual</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all placeholder-gray-700"
                                        placeholder="Digite a senha atual"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-gray-400 text-xs font-bold uppercase ml-1">Nova Senha</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="bg-obsidian-elevated border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full p-3 outline-none transition-all placeholder-gray-700"
                                        placeholder="Digite a nova senha"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 sm:pt-6 border-t border-[#333] flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 border-champberry/60 bg-transparent text-champberry font-sans border font-black rounded-xl shadow-lg hover:shadow-champberry/20 active:scale-95 cursor-pointer disabled:opacity-50 transition-all duration-500 ease-luxury hover:bg-champberry hover:text-white hover:border-champberry text-sm"
                            >
                                <Save size={16} />
                                {isLoading ? t('common.loading') : t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Configuration
