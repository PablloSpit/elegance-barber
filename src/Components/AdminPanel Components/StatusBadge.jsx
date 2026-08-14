import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const StatusBadge = ({ status }) => {
    const { t } = useTranslation()
    const styles = {
        Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
        Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
        Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
        "Awaiting Confirmation": 'bg-purple-500/10 text-purple-400 border-purple-500/10',
        "Checked In": 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
        "Missed": 'bg-gray-500/10 text-gray-400 border-gray-500/10',
        "Faltou": 'bg-gray-500/10 text-gray-400 border-gray-500/10',
    }
    const icon = {
        Completed: <CheckCircle2 size={12} />,
        Pending: <Clock size={12} />,
        Cancelled: <XCircle size={12} />,
        Confirmed: <CheckCircle2 size={12} />,
        "Awaiting Confirmation": <Clock size={12} />,
        "Checked In": <CheckCircle2 size={12} />,
        "Missed": <XCircle size={12} />,
        "Faltou": <XCircle size={12} />,
    }
    const label = {
        Completed: t('appointments.status.completed'),
        Pending: t('appointments.status.pending'),
        Cancelled: t('appointments.status.cancelled'),
        Confirmed: t('appointments.status.confirmed'),
        "Awaiting Confirmation": t('appointments.status.awaiting_confirmation'),
        "Checked In": t('appointments.status.checked_in'),
        "Missed": t('appointments.status.missed'),
        "Faltou": t('appointments.status.missed'),
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${styles[status] || styles.Pending} transition-colors`}>
            {icon[status]}
            {label[status] || status}
        </span>
    )
}

export default StatusBadge