import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAppointment } from '../../Context/AppointmentContext'
import {
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    X
} from 'lucide-react'
import StatusBadge from '../../Components/AdminPanel Components/StatusBadge'
import AppointmentMenu from '../../Components/AdminPanel Components/AppointmentMenu'
import EditAppointmentModal from '../../Components/AdminPanel Components/EditAppointmentModal'
import ViewAppointmentModal from '../../Components/AdminPanel Components/ViewAppointmentModal'
import SortableHeader from '../../Components/AdminPanel Components/SortableHeader'

// Helper functions outside component for better performance
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
    // dateStr is like "02/11/2026"
    return new Date(dateStr)
}

const categories = ['All', 'Confirmed', 'Pending', 'Awaiting Confirmation', 'Cancelled', 'Completed', 'Faltou']
const categoryMap = {
    'All': 'appointments.status.all',
    'Confirmed': 'appointments.status.confirmed',
    'Pending': 'appointments.status.pending',
    'Awaiting Confirmation': 'appointments.status.awaiting_confirmation',
    'Cancelled': 'appointments.status.cancelled',
    'Completed': 'appointments.status.completed',
    'Faltou': 'appointments.status.missed'
}

function Appointments() {
    const { appointments } = useAppointment()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [editingAppointment, setEditingAppointment] = useState(null)
    const [viewingAppointment, setViewingAppointment] = useState(null)
    const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
    const [timeFilter, setTimeFilter] = useState({ from: '', to: '' })

    // Sort and additional filter states
    const [sortConfig, setSortConfig] = useState({ field: 'id', direction: 'desc' })
    const [showFilterPanel, setShowFilterPanel] = useState(false)
    const [stylistFilter, setStylistFilter] = useState('all')
    const [selectedPreset, setSelectedPreset] = useState(null)

    const getServiceText = (appointment) =>
        appointment.items?.map(item => item.service.name).join(', ') || appointment.service || ''

    const getStylistText = (appointment) =>
        appointment.items?.map(item => item.stylist?.name).filter(Boolean).join(', ') || appointment.stylistName || ''

    const getTotalPrice = (appointment) => {
        if (Number.isFinite(Number(appointment.totalPrice))) return Number(appointment.totalPrice)
        return appointment.items?.reduce((sum, item) => sum + parseFloat(item.service.price?.replace('$', '') || 0), 0) || 0
    }

    // Derived state - memoized for performance
    const uniqueStylists = useMemo(() =>
        [...new Set(appointments.flatMap(a => a.items?.map(item => item.stylist?.name) || []).filter(Boolean))],
        [appointments]
    )

    const hasActiveFilters = dateFilter.from || timeFilter.from || stylistFilter !== 'all'
    const activeFilterCount = [dateFilter.from, timeFilter.from, stylistFilter !== 'all'].filter(Boolean).length

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

        // Calculate this week (Sunday to Saturday)
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekStartStr = formatLocalDate(weekStart)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const weekEndStr = formatLocalDate(weekEnd)

        // Calculate this month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthStartStr = formatLocalDate(monthStart)

        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        const monthEndStr = formatLocalDate(monthEnd)

        const presets = {
            'Today': {
                from: todayStr,
                to: todayStr
            },
            'Tomorrow': {
                from: tomorrowStr,
                to: tomorrowStr
            },
            'This Week': {
                from: weekStartStr,
                to: weekEndStr
            },
            'This Month': {
                from: monthStartStr,
                to: monthEndStr
            }
        }

        setDateFilter(presets[preset])
        setSelectedPreset(preset)
    }, [])

    const clearAllFilters = useCallback(() => {
        setDateFilter({ from: '', to: '' })
        setTimeFilter({ from: '', to: '' })
        setStylistFilter('all')
        setSelectedPreset(null)
    }, [])

    const handleEdit = useCallback((appointment) => {
        setEditingAppointment(appointment)
    }, [])

    const handleView = useCallback((appointment) => {
        setViewingAppointment(appointment)
    }, [])

    // Enhanced filter and sort logic - optimized with useMemo
    const filteredAndSortedAppointments = useMemo(() => {
        let result = appointments.filter(appointment => {
            // Search filter
            const matchedSearch = !searchTerm ||
                appointment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.phone?.includes(searchTerm) ||
                getServiceText(appointment).toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.id?.toString().includes(searchTerm) ||
                getStylistText(appointment).toLowerCase().includes(searchTerm.toLowerCase())

            // Status filter
            const matchedStatus = statusFilter === 'All' || appointment.status === statusFilter

            // Date filter - simple date comparison (compare only dates, not times)
            let matchedDate = true
            if (dateFilter.from) {
                const appointmentDate = parseStoredDate(appointment.date)
                const fromDate = new Date(dateFilter.from)
                const toDate = dateFilter.to ? new Date(dateFilter.to) : fromDate

                if (appointmentDate) {
                    // Set all times to midnight to compare only dates
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

            // Stylist filter
            const matchedStylist = stylistFilter === 'all' || appointment.items?.some(item => item.stylist?.name === stylistFilter)

            return matchedSearch && matchedStatus && matchedDate && matchedTime && matchedStylist
        })

        // Apply sorting
        if (sortConfig.field) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.field]
                let bVal = b[sortConfig.field]

                if (sortConfig.field === 'service') {
                    aVal = getServiceText(a)
                    bVal = getServiceText(b)
                }

                if (sortConfig.field === 'stylistName') {
                    aVal = getStylistText(a)
                    bVal = getStylistText(b)
                }

                // Handle date sorting - convert MM/DD/YYYY to Date
                if (sortConfig.field === 'date') {
                    aVal = parseStoredDate(a.date)
                    bVal = parseStoredDate(b.date)
                }

                // Handle numeric sorting
                if (sortConfig.field === 'id') {
                    aVal = parseInt(aVal, 10)
                    bVal = parseInt(bVal, 10)
                }

                // Handle null/undefined values
                if (!aVal) return 1
                if (!bVal) return -1

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }

        return result
    }, [appointments, searchTerm, statusFilter, dateFilter, timeFilter, stylistFilter, sortConfig])

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                        Gestão de <span className="text-champberry">Agendamentos</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">Visualize e gerencie todas as reservas de clientes</p>
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
                            placeholder={t('appointments.placeholders.search', 'Buscar cliente, serviço, ID...')}
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
                                <option key={cat} value={cat}>{t(categoryMap[cat], cat)}</option>
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
                            <span>{t('appointments.filters.title', 'Filtros')}</span>
                            {hasActiveFilters && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-champberry text-black text-xs font-black rounded-full flex items-center justify-center shadow-lg">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Filter Panel */}
                        {showFilterPanel && (
                            <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto w-full sm:w-80 bg-obsidian-surface border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {/* Panel Header */}
                                <div className="bg-obsidian-surface px-4 py-3 border-b border-[#333] flex justify-between items-center">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">{t('appointments.filters.panel_title', 'Filtrar Agendamentos')}</h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-champberry hover:text-white transition-colors font-bold uppercase tracking-wide"
                                    >
                                        {t('appointments.filters.clear_all', 'Limpar Tudo')}
                                    </button>
                                </div>

                                {/* Panel Content */}
                                <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                    {/* Quick Date Presets */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">
                                            {t('appointments.filters.quick_filter', 'Filtro Rápido')}
                                        </label>
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
                                                    {preset === 'Today' ? t('appointments.filters.today', 'Hoje') : preset === 'Tomorrow' ? t('appointments.filters.tomorrow', 'Amanhã') : preset === 'This Week' ? t('appointments.filters.this_week', 'Esta Semana') : t('appointments.filters.this_month', 'Este Mês')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Date Range */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">
                                            {t('appointments.filters.date_range', 'Intervalo de Datas')}
                                        </label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={dateFilter.from}
                                                    onChange={(e) => {
                                                        setDateFilter({ ...dateFilter, from: e.target.value })
                                                        setSelectedPreset(null)
                                                    }}
                                                    className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                                    placeholder="De"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={dateFilter.to}
                                                    onChange={(e) => {
                                                        setDateFilter({ ...dateFilter, to: e.target.value })
                                                        setSelectedPreset(null)
                                                    }}
                                                    className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none transition-all"
                                                    placeholder="Até"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Range */}
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">
                                            Intervalo de Horário
                                        </label>
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

                                    {/* Stylist Filter */}
                                    {uniqueStylists.length > 0 && (
                                        <div>
                                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2 block">
                                                Profissional
                                            </label>
                                            <select
                                                value={stylistFilter}
                                                onChange={(e) => setStylistFilter(e.target.value)}
                                                className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champberry focus:ring-1 focus:ring-champberry outline-none appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="all">Todos os Profissionais</option>
                                                {uniqueStylists.map(stylist => (
                                                    <option key={stylist} value={stylist}>{stylist}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Panel Footer */}
                                <div className="bg-obsidian-surface px-4 py-3 border-t border-[#333]">
                                    <button
                                        onClick={() => setShowFilterPanel(false)}
                                        className="w-full bg-champberry hover:bg-champberry-dark text-black cursor-pointer font-black py-2.5 rounded-lg transition-colors text-sm uppercase tracking-wide shadow-lg"
                                    >
                                        Aplicar Filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 items-center bg-obsidian-surface/30 border border-[#333] rounded-lg p-3">
                    <span className="text-champberry-muted text-xs font-bold uppercase tracking-wider">Filtros Ativos:</span>

                    {dateFilter.from && (
                        <span className="bg-obsidian-elevated border border-champberry/50 text-champberry px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium">
                            <Calendar size={12} />
                            {dateFilter.from} {dateFilter.to && `→ ${dateFilter.to}`}
                            <button
                                onClick={() => {
                                    setDateFilter({ from: '', to: '' })
                                    setSelectedPreset(null)
                                }}
                                className="hover:text-white transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    )}

                    {timeFilter.from && (
                        <span className="bg-obsidian-elevated border border-champberry/50 text-champberry px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium">
                            <Clock size={12} />
                            {timeFilter.from} {timeFilter.to && `→ ${timeFilter.to}`}
                            <button
                                onClick={() => setTimeFilter({ from: '', to: '' })}
                                className="hover:text-white transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    )}

                    {stylistFilter !== 'all' && (
                        <span className="bg-obsidian-elevated border border-champberry/50 text-champberry px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium">
                            <User size={12} />
                            {stylistFilter}
                            <button
                                onClick={() => setStylistFilter('all')}
                                className="hover:text-white transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    )}

                    <button
                        onClick={clearAllFilters}
                        className="ml-auto text-xs text-white hover:text-champberry transition-colors font-bold uppercase tracking-wide"
                    >
                        Limpar Tudo
                    </button>
                </div>
            )}

            {/* Appointments Table Card */}
            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">

                {/* Loader / Empty State */}
                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-obsidian-elevated p-4 rounded-full mb-4">
                            <Calendar size={48} className="text-[#333]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum Agendamento Encontrado</h3>
                        <p className="text-champberry-muted max-w-md">Não há agendamentos no sistema ainda. Novas reservas aparecerão aqui.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto min-h-100">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-obsidian-surface text-[#777] uppercase text-[11px] font-bold tracking-wider border-b border-[#333]">
                                    <tr>
                                        <SortableHeader field="id" currentSort={sortConfig} onSort={handleSort}>
                                            ID
                                        </SortableHeader>
                                        <SortableHeader field="name" currentSort={sortConfig} onSort={handleSort}>
                                            Client Details
                                        </SortableHeader>
                                        <SortableHeader field="service" currentSort={sortConfig} onSort={handleSort}>
                                            Service Info
                                        </SortableHeader>
                                        <SortableHeader field="stylistName" currentSort={sortConfig} onSort={handleSort}>
                                            Stylist
                                        </SortableHeader>
                                        <SortableHeader field="date" currentSort={sortConfig} onSort={handleSort}>
                                            Data e Hora
                                        </SortableHeader>
                                        <SortableHeader field="status" currentSort={sortConfig} onSort={handleSort}>
                                            Status
                                        </SortableHeader>
                                        <th className="px-6 py-5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredAndSortedAppointments.length > 0 ? (
                                        filteredAndSortedAppointments.map((appointment) => (
                                            <tr key={appointment.id} className="hover:bg-white/2 transition-colors group">
                                                <td className="px-6 py-4 text-[#555] font-mono text-xs">
                                                    #{appointment.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-champberry to-champberry-dark flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                            {appointment.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-bold text-white text-sm">{appointment.name}</div>
                                                                {appointment.userId == null && (
                                                                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-champberry text-black text-[10px] font-bold uppercase">Visitante</div>
                                                                )}
                                                            </div>
                                                            <div className="text-[#777] text-xs flex items-center gap-1 mt-0.5">
                                                                {appointment.phone || "Sem Telefone"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-300 text-sm font-medium">{getServiceText(appointment) || '—'}</div>
                                                    <div className="text-champberry text-xs font-bold mt-1">R$ {getTotalPrice(appointment)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStylistText(appointment) ? (
                                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                                            <User size={12} /> {getStylistText(appointment)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#555] text-xs italic">Não atribuído</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                                                            <Calendar size={12} className="text-champberry-muted" /> {appointment.date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[#777] text-xs mt-1 pl-0.5">
                                                            <Clock size={12} /> {appointment.time}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={appointment.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <AppointmentMenu
                                                        appointment={appointment}
                                                        onEdit={handleEdit}
                                                        onView={handleView}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Search size={48} className="text-[#333]" />
                                                    <h3 className="text-white font-bold text-lg">Nenhum agendamento encontrado</h3>
                                                    <p className="text-champberry-muted max-w-md text-sm">
                                                        {hasActiveFilters
                                                            ? "Tente ajustar seus filtros ou termos de busca para encontrar o que procura."
                                                            : "Nenhum agendamento corresponde aos seus critérios de busca."}
                                                    </p>
                                                    {hasActiveFilters && (
                                                        <button
                                                            onClick={clearAllFilters}
                                                            className="mt-2 px-6 py-2.5 bg-champberry hover:bg-champberry-dark text-white cursor-pointer font-bold rounded-lg text-sm transition-colors uppercase tracking-wide shadow-lg"
                                                        >
                                                            Limpar Todos os Filtros
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet Card View */}
                        <div className="lg:hidden">
                            {filteredAndSortedAppointments.length > 0 ? (
                                <div className="p-3 sm:p-4 space-y-3">
                                    {filteredAndSortedAppointments.map((appointment) => (
                                        <div key={appointment.id} className="bg-obsidian-elevated p-3 sm:p-4 rounded-xl border border-white/5 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <div className="w-9 h-9 shrink-0 rounded-full bg-linear-to-br from-champberry to-champberry-dark flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                                        {appointment.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <h4 className="font-bold text-white text-sm truncate">{appointment.name}</h4>
                                                            <span className="text-[#555] font-mono text-[10px]">#{appointment.id}</span>
                                                            {appointment.userId == null && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-champberry/20 text-champberry text-[9px] font-bold uppercase">Visitante</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[#777] text-xs truncate mt-0.5">{getServiceText(appointment) || '—'}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={appointment.status} />
                                            </div>

                                            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Calendar size={11} className="shrink-0" />
                                                        <span>{appointment.date}</span>
                                                        <span className="text-[#333]">|</span>
                                                        <span>{appointment.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-[#777]">
                                                        <User size={11} className="shrink-0" />
                                                        <span className="truncate">{getStylistText(appointment) || 'Não atribuído'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-champberry font-bold text-sm">R$ {getTotalPrice(appointment)}</span>
                                                    <AppointmentMenu
                                                        appointment={appointment}
                                                        onEdit={handleEdit}
                                                        onView={handleView}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
                                    <Search size={40} className="text-[#333]" />
                                    <h3 className="text-white font-bold text-base">Nenhum agendamento encontrado</h3>
                                    <p className="text-champberry-muted text-xs max-w-sm">
                                        {hasActiveFilters
                                            ? "Tente ajustar seus filtros ou termos de busca."
                                            : "Nenhum agendamento corresponde aos seus critérios de busca."}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="mt-2 px-4 py-2 bg-champberry hover:bg-champberry-dark text-white cursor-pointer font-bold rounded-lg text-xs transition-colors uppercase tracking-wide shadow-lg"
                                        >
                                            Limpar Todos os Filtros
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer / Pagination Placeholder */}
                        <div className="bg-obsidian-surface px-3 sm:px-6 py-3 sm:py-4 border-t border-[#333] flex justify-between items-center text-[10px] sm:text-xs text-champberry-muted">
                            <span>Exibindo <span className="text-champberry font-bold">{filteredAndSortedAppointments.length}</span> de <span className="text-white font-bold">{appointments.length}</span></span>
                            <div className="flex gap-1.5 sm:gap-2">
                                <button className={`px-2 sm:px-3 py-1 bg-obsidian-surface border border-[#333] rounded hover:border-champberry hover:text-champberry transition-colors disabled:opacity-50 ${filteredAndSortedAppointments.length === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>Anterior</button>
                                <button className={`px-2 sm:px-3 py-1 bg-obsidian-surface border border-[#333] rounded hover:border-champberry hover:text-champberry transition-colors disabled:opacity-50 ${filteredAndSortedAppointments.length > 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>Próximo</button>
                            </div>
                        </div>
                    </>
                )}
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
        </div >
    )
}

export default Appointments
