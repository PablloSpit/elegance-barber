import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppointment } from '../../Context/AppointmentContext'
import { useAuth } from '../../Context/AuthContext'
import {
    Search,
    Filter,
    Calendar,
    X
} from 'lucide-react'
import StatusBadge from '../../Components/AdminPanel Components/StatusBadge'
import StaffAppointmentMenu from '../../Components/StaffPanel Components/StaffAppointmentMenu'
import EditAppointmentModal from '../../Components/AdminPanel Components/EditAppointmentModal'
import ViewAppointmentModal from '../../Components/AdminPanel Components/ViewAppointmentModal'
import SortableHeader from '../../Components/AdminPanel Components/SortableHeader'

// Format date for filter panel (YYYY-MM-DD for date input)
const formatLocalDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Convert MM/DD/YYYY stored date to Date object for comparison
const parseStoredDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr)
}

function StaffAppointments() {
    const { t } = useTranslation()
    const { getAppointmentsForStaff } = useAppointment()
    const { currentUser } = useAuth()

    const categories = useMemo(() => [
        'All',
        'Confirmed',
        'Pending',
        'Awaiting Confirmation',
        'Cancelled',
        'Completed',
        'Checked In',
        'Missed'
    ], [])

    // Fetch only this staff's appointments
    const appointments = useMemo(() => {
        if (!currentUser) return []
        return getAppointmentsForStaff(currentUser.id)
    }, [currentUser, getAppointmentsForStaff])

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [editingAppointment, setEditingAppointment] = useState(null)
    const [viewingAppointment, setViewingAppointment] = useState(null)
    const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
    const [timeFilter, setTimeFilter] = useState({ from: '', to: '' })

    // Sort and additional filter states
    const [sortConfig, setSortConfig] = useState({ field: 'id', direction: 'desc' })
    const [showFilterPanel, setShowFilterPanel] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState(null)

    const hasActiveFilters = dateFilter.from || timeFilter.from
    const activeFilterCount = [dateFilter.from, timeFilter.from].filter(Boolean).length

    // Close filter panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showFilterPanel && !e.target.closest('.filter-panel-container')) {
                setShowFilterPanel(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showFilterPanel])

    // Memoized handlers for better performance
    const handleSort = useCallback((field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }, [])

    const applyDatePreset = useCallback((preset) => {
        const today = new Date()
        const todayStr = formatLocalDate(today)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = formatLocalDate(tomorrow)

        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekStartStr = formatLocalDate(weekStart)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const weekEndStr = formatLocalDate(weekEnd)

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthStartStr = formatLocalDate(monthStart)

        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        const monthEndStr = formatLocalDate(monthEnd)

        const presets = {
            'Today': { from: todayStr, to: todayStr },
            'Tomorrow': { from: tomorrowStr, to: tomorrowStr },
            'This Week': { from: weekStartStr, to: weekEndStr },
            'This Month': { from: monthStartStr, to: monthEndStr }
        }

        setDateFilter(presets[preset])
        setSelectedPreset(preset)
    }, [])

    const clearAllFilters = useCallback(() => {
        setDateFilter({ from: '', to: '' })
        setTimeFilter({ from: '', to: '' })
        setSelectedPreset(null)
    }, [])

    const handleEdit = useCallback((appointment) => setEditingAppointment(appointment), [])
    const handleView = useCallback((appointment) => setViewingAppointment(appointment), [])

    const getAssignedServices = useCallback((appointment) => {
        if (!currentUser) return []
        return (appointment.items || []).filter(item => {
            const stylist = item.stylist
            return stylist && (stylist.id === currentUser.id || stylist.email?.toLowerCase() === currentUser.email?.toLowerCase())
        }).map(item => item.service) || []
    }, [currentUser])

    const getAssignedServiceText = useCallback((appointment) => {
        const list = getAssignedServices(appointment)
        return list.length ? list.map(s => s.name).join(', ') : '—'
    }, [getAssignedServices])

    const getAssignedTotal = useCallback((appointment) =>
        getAssignedServices(appointment).reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : parseFloat(s.price?.toString().replace('R$ ', '').replace('$', '') || 0)), 0),
        [getAssignedServices])

    // Enhanced filter and sort logic - optimized with useMemo
    const filteredAndSortedAppointments = useMemo(() => {
        let result = appointments.filter(appointment => {
            // Search filter
            const matchedSearch = !searchTerm ||
                appointment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.phone?.includes(searchTerm) ||
                getAssignedServiceText(appointment).toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.id?.toString().includes(searchTerm) ||
                appointment.email?.toLowerCase().includes(searchTerm.toLowerCase())

            // Status filter
            const matchedStatus = statusFilter === 'All' || appointment.status === statusFilter

            // Date filter
            let matchedDate = true
            if (dateFilter.from) {
                const appointmentDate = parseStoredDate(appointment.date)
                const fromDate = new Date(dateFilter.from)
                const toDate = dateFilter.to ? new Date(dateFilter.to) : fromDate

                if (appointmentDate) {
                    appointmentDate.setHours(0, 0, 0, 0)
                    fromDate.setHours(0, 0, 0, 0)
                    toDate.setHours(23, 59, 59, 999)

                    matchedDate = appointmentDate >= fromDate && appointmentDate <= toDate
                }
            }

            // Time filter
            let matchedTime = true
            if (timeFilter.from) {
                const toTime = timeFilter.to || '23:59'
                matchedTime = appointment.time >= timeFilter.from && appointment.time <= toTime
            }

            return matchedSearch && matchedStatus && matchedDate && matchedTime
        })

        // Apply sorting
        if (sortConfig.field) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.field]
                let bVal = b[sortConfig.field]

                if (sortConfig.field === 'service') {
                    aVal = getAssignedServiceText(a)
                    bVal = getAssignedServiceText(b)
                }

                if (sortConfig.field === 'date') {
                    aVal = parseStoredDate(a.date)
                    bVal = parseStoredDate(b.date)
                }

                if (sortConfig.field === 'id') {
                    aVal = parseInt(aVal, 10)
                    bVal = parseInt(bVal, 10)
                }

                if (!aVal) return 1
                if (!bVal) return -1

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }

        return result
    }, [appointments, searchTerm, statusFilter, dateFilter, timeFilter, sortConfig, getAssignedServiceText])

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                        {t('nav.my_appointments').split(' ')[0]} <span className="text-champberry">{t('nav.my_appointments').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('home.staff_schedule_subtitle')}</p>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group flex-1 sm:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted group-focus-within:text-champberry transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('appointments.placeholders.search')}
                            className="bg-obsidian-surface border border-[#333] text-white text-xs sm:text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full sm:w-52 md:w-64 pl-9 sm:pl-10 p-2 sm:p-2.5 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative flex-1 sm:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-champberry-muted">
                            <Filter size={16} />
                        </div>
                        <select
                            className="bg-obsidian-surface border border-[#333] text-white text-xs sm:text-sm rounded-lg focus:ring-1 focus:ring-champberry focus:border-champberry block w-full sm:w-44 md:w-48 pl-9 sm:pl-10 p-2 sm:p-2.5 appearance-none cursor-pointer outline-none transition-all"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'All' ? t('appointments.status.all') : t(`appointments.status.${cat.toLowerCase().replace(/ /g, '_')}`)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-champberry-muted">
                            <span className="text-xs">▼</span>
                        </div>
                    </div>

                    {/* Advanced Filter Button */}
                    <div className="relative filter-panel-container">
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`relative bg-obsidian-surface border ${hasActiveFilters ? 'border-champberry text-champberry' : 'border-[#333] text-gray-400'
                                } text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 hover:border-champberry hover:text-champberry transition-all outline-none w-full sm:w-auto justify-center font-medium cursor-pointer`}
                        >
                            <Filter size={16} />
                            <span>{t('appointments.filters.title')}</span>
                            {hasActiveFilters && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-champberry text-black text-xs font-black rounded-full flex items-center justify-center shadow-lg">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Filter Panel */}
                        {showFilterPanel && (
                            <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto w-full sm:w-80 bg-obsidian-surface border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-obsidian-surface px-4 py-3 border-b border-[#333] flex justify-between items-center">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">{t('appointments.filters.panel_title')}</h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-champberry hover:text-white transition-colors font-bold uppercase tracking-wide"
                                    >
                                        {t('appointments.filters.clear_all')}
                                    </button>
                                </div>

                                <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                    {/* Quick Date Presets */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">{t('appointments.filters.quick_filter')}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Today', 'Tomorrow', 'This Week', 'This Month'].map(preset => (
                                                <button
                                                    key={preset}
                                                    onClick={() => applyDatePreset(preset)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${selectedPreset === preset
                                                        ? 'bg-champberry border-champberry text-black shadow-lg shadow-champberry/30'
                                                        : 'bg-obsidian border-[#333] text-gray-400 hover:border-champberry hover:text-champberry'
                                                        }`}
                                                >
                                                    {t(`appointments.filters.${preset.toLowerCase().replace(/ /g, '_')}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Date Range */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">{t('appointments.filters.date_range')}</label>
                                        <div className="space-y-2">
                                            <input
                                                type="date"
                                                value={dateFilter.from}
                                                onChange={(e) => {
                                                    setDateFilter({ ...dateFilter, from: e.target.value })
                                                    setSelectedPreset(null)
                                                }}
                                                className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                            />
                                            <input
                                                type="date"
                                                value={dateFilter.to}
                                                onChange={(e) => {
                                                    setDateFilter({ ...dateFilter, to: e.target.value })
                                                    setSelectedPreset(null)
                                                }}
                                                className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Time Range */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">{t('appointments.filters.time_range')}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="time"
                                                value={timeFilter.from}
                                                onChange={(e) => setTimeFilter({ ...timeFilter, from: e.target.value })}
                                                className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                            />
                                            <input
                                                type="time"
                                                value={timeFilter.to}
                                                onChange={(e) => setTimeFilter({ ...timeFilter, to: e.target.value })}
                                                className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table/List View */}
            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {filteredAndSortedAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-white/2 p-4 rounded-full mb-4">
                            <Calendar size={48} className="text-[#333]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{t('home.no_appointments_assigned')}</h3>
                        <p className="text-champberry-muted max-w-sm mx-auto">
                            {t('home.staff_schedule_subtitle')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/2 text-[#555] uppercase text-[11px] font-bold tracking-wider border-b border-white/5">
                                    <tr>
                                        <SortableHeader field="id" currentSort={sortConfig} onSort={handleSort}>ID</SortableHeader>
                                        <SortableHeader field="name" currentSort={sortConfig} onSort={handleSort}>{t('appointments.client_details')}</SortableHeader>
                                        <SortableHeader field="service" currentSort={sortConfig} onSort={handleSort}>{t('appointments.service_info')}</SortableHeader>
                                        <SortableHeader field="date" currentSort={sortConfig} onSort={handleSort}>{t('common.date_time')}</SortableHeader>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredAndSortedAppointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-white/2 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500 font-mono text-xs">#{appointment.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-champberry/20 to-champberry-dark/20 flex items-center justify-center text-champberry font-bold text-sm border border-champberry/20">
                                                        {appointment.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white text-sm">{appointment.name}</span>
                                                        <span className="text-gray-500 text-xs">{appointment.phone || t('appointments.no_phone')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs font-medium max-w-[200px] truncate">
                                                        {getAssignedServiceText(appointment)}
                                                    </span>
                                                    <span className="text-champberry font-bold text-xs mt-0.5">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAssignedTotal(appointment))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium text-xs">{appointment.date}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">{appointment.time}</span>
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

                        {/* Mobile List View */}
                        <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {filteredAndSortedAppointments.map((appointment) => (
                                <div key={appointment.id} className="bg-obsidian-elevated p-4 rounded-xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-champberry/20 to-champberry-dark/20 flex items-center justify-center text-champberry font-bold border border-champberry/20">
                                                {appointment.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{appointment.name}</h4>
                                                <span className="text-xs text-gray-500">#{appointment.id}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={appointment.status} />
                                    </div>

                                    <div className="py-3 border-y border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar size={12} className="text-champberry" />
                                            <span>{appointment.date}</span>
                                            <span className="text-white/10">|</span>
                                            <span>{appointment.time}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">{t('inventory.service')}</span>
                                            <span className="text-white text-sm font-medium">{getAssignedServiceText(appointment)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-champberry font-black text-lg">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAssignedTotal(appointment))}
                                        </span>
                                        <StaffAppointmentMenu
                                            appointment={appointment}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination/Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-obsidian-surface/30 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-gray-500 font-medium">
                    {t('common.showing')} <span className="text-white">{filteredAndSortedAppointments.length}</span> {t('common.of')} <span className="text-white">{appointments.length}</span> {t('admin.appointments').toLowerCase()}
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5 rounded-lg hover:text-white transition-colors disabled:opacity-30" disabled>
                        {t('common.previous')}
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5 rounded-lg hover:text-white transition-colors disabled:opacity-30" disabled>
                        {t('common.next')}
                    </button>
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

export default StaffAppointments