import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Calendar,
    TrendingUp,
    Scissors,
    CheckCircle2
} from 'lucide-react'
import { useAppointment } from '../../Context/AppointmentContext'
import { useAuth } from '../../Context/AuthContext'
import StatsCard from '../../Components/AdminPanel Components/StatsCard'
import StatusBadge from '../../Components/AdminPanel Components/StatusBadge'
import StaffAppointmentMenu from '../../Components/StaffPanel Components/StaffAppointmentMenu'
import EditAppointmentModal from '../../Components/AdminPanel Components/EditAppointmentModal'
import ViewAppointmentModal from '../../Components/AdminPanel Components/ViewAppointmentModal'

function StaffDashboard() {
    const { t } = useTranslation()
    const { getAppointmentsForStaff } = useAppointment()
    const { currentUser } = useAuth()

    const [editingAppointment, setEditingAppointment] = useState(null)
    const [viewingAppointment, setViewingAppointment] = useState(null)

    const handleEdit = (appointment) => setEditingAppointment(appointment)
    const handleView = (appointment) => setViewingAppointment(appointment)

    const getAssignedServices = useCallback((appointment) => {
        if (!currentUser) return []
        return (appointment.items || []).filter(item => {
            const stylist = item.stylist
            return stylist && (stylist.id === currentUser.id || stylist.email?.toLowerCase() === currentUser.email?.toLowerCase())
        }).map(item => item.service) || []
    }, [currentUser])

    const getAssignedTotal = useCallback((appointment) =>
        getAssignedServices(appointment).reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : parseFloat(s.price?.toString().replace('R$ ', '').replace('$', '') || 0)), 0),
        [getAssignedServices])

    const getAssignedServiceText = useCallback((appointment) => {
        const list = getAssignedServices(appointment)
        return list.length ? list.map(s => s.name).join(', ') : '—'
    }, [getAssignedServices])

    const myAppointments = useMemo(() => {
        if (!currentUser) return []
        return getAppointmentsForStaff(currentUser.id)
    }, [currentUser, getAppointmentsForStaff])

    const totalRevenue = useMemo(() => {
        if (!currentUser) return 0
        return myAppointments.filter(a => a.status === 'Completed').reduce((acc, curr) => {
            const assignedItems = (curr.items || []).filter(item => {
                const stylist = item.stylist
                return stylist && (stylist.id === currentUser.id || stylist.email?.toLowerCase() === currentUser.email?.toLowerCase())
            })
            const sumForAppointment = assignedItems.reduce((sub, item) => {
                const price = typeof item.service.price === 'number' ? item.service.price : parseFloat(item.service.price?.toString().replace('R$ ', '').replace('$', '') || 0)
                const commission = parseFloat(item.stylist?.commission || currentUser?.commission || 0)
                return sub + (price * commission)
            }, 0)
            return acc + sumForAppointment
        }, 0)
    }, [currentUser, myAppointments])

    const pendingJobs = useMemo(
        () => myAppointments.filter(a => a.status === 'Awaiting Confirmation' || a.status === 'Confirmed' || a.status === 'Checked In').length,
        [myAppointments]
    )

    const completedJobs = useMemo(
        () => myAppointments.filter(a => a.status === 'Completed').length,
        [myAppointments]
    )

    const todayAppointments = useMemo(
        () => [...myAppointments].sort((a, b) => b.id - a.id),
        [myAppointments]
    )

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-0">
            {/* Greeting Header */}
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2">
                    {t('home.welcome_back', { name: currentUser?.name || t('home.guest') })}
                </h1>
                <p className="text-xs sm:text-sm text-champberry-muted">{t('home.staff_schedule_subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatsCard
                    title={t('home.total_assigned')}
                    value={myAppointments.length}
                    change={myAppointments.length > 0 ? t('home.active') : t('home.none')}
                    positive={true}
                    icon={<Calendar size={24} />}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatsCard
                    title={t('home.pending_jobs')}
                    value={pendingJobs}
                    change={pendingJobs > 0 ? t('home.needs_action') : t('home.all_clear')}
                    positive={pendingJobs === 0}
                    icon={<Scissors size={24} />}
                    color="text-champberry"
                    bg="bg-champberry/10"
                />
                <StatsCard
                    title={t('home.completed_jobs')}
                    value={completedJobs}
                    change={t('home.great_work')}
                    positive={true}
                    icon={<CheckCircle2 size={24} />}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatsCard
                    title={t('home.total_commissions')}
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                    change={t('home.estimated')}
                    positive={totalRevenue > 0}
                    icon={<TrendingUp size={24} />}
                    color="text-emerald-400"
                    bg="bg-emerald-400/10"
                />
            </div>

            {/* Appointments Table Section */}
            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-obsidian-surface px-4 sm:px-6 py-4 sm:py-6 border-b border-[#333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-champberry flex items-center gap-2 sm:gap-3">
                        <span className="text-white">{t('admin.recent')}</span> {t('admin.appointments')}
                    </h2>
                    <button className="px-4 sm:px-6 py-2 bg-obsidian text-white border border-[#333] hover:border-champberry hover:text-champberry text-[10px] sm:text-xs font-bold rounded-lg transition-all uppercase tracking-wider shadow-lg cursor-pointer">
                        <Link to="/staff/appointments" className="flex items-center gap-1">
                            {t('home.view_all_my_appointments')}
                        </Link>
                    </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/2 text-[#555] uppercase text-[11px] font-bold tracking-wider sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4">{t('inventory.customer')}</th>
                                <th className="px-6 py-4">{t('inventory.service')}</th>
                                <th className="px-6 py-4">{t('common.date_time')}</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {todayAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[#777]">{t('home.no_appointments_assigned')}</td>
                                </tr>
                            ) : todayAppointments.slice(0, 5).map((appointment, idx) => (
                                <tr key={appointment.id || idx} className="hover:bg-white/2 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://placehold.co/150x150/222/FFF?text=${appointment.name.charAt(0)}`} alt={appointment.name} className="w-9 h-9 rounded-full border border-white/10" />
                                            <span className="font-semibold text-white text-sm">
                                                {appointment.name}
                                                {appointment.userId == null && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-champberry text-black text-[10px] font-bold uppercase">{t('home.guest')}</span>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#a1a1aa]">{getAssignedServiceText(appointment)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium text-xs">{appointment.date}</span>
                                            <span className="text-[#939292] text-xs pl-4">{appointment.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={appointment.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <StaffAppointmentMenu
                                            appointment={appointment}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {todayAppointments.length === 0 ? (
                        <div className="text-center text-[#777] py-8">{t('home.no_appointments_assigned')}</div>
                    ) : todayAppointments.slice(0, 5).map((appointment, idx) => (
                        <div key={appointment.id || idx} className="bg-obsidian-elevated p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={`https://placehold.co/150x150/222/FFF?text=${appointment.name.charAt(0)}`} alt={appointment.name} className="w-10 h-10 rounded-full border border-white/10" />
                                    <div>
                                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                            <span>{appointment.name}</span>
                                        </h4>
                                        <div className="text-xs text-[#777] flex items-center gap-1 mt-0.5">
                                            {getAssignedServiceText(appointment)}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={appointment.status} />
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Calendar size={12} />
                                        <span>{appointment.date}</span>
                                        <span className="text-[#333]">|</span>
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative">
                                    <span className="text-white font-bold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAssignedTotal(appointment))}</span>
                                    <StaffAppointmentMenu
                                        appointment={appointment}
                                        onEdit={handleEdit}
                                        onView={handleView}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {editingAppointment && (
                <EditAppointmentModal
                    appointment={editingAppointment}
                    onClose={() => setEditingAppointment(null)}
                />
            )}
            {viewingAppointment && (
                <ViewAppointmentModal
                    appointment={viewingAppointment}
                    onClose={() => setViewingAppointment(null)}
                />
            )}
        </div>
    )
}

export default StaffDashboard