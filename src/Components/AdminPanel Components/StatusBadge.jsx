import { CheckCircle2, Clock, XCircle } from 'lucide-react'

const StatusBadge = ({ status }) => {
    const styles = {
        Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
        Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
        Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
        "Awaiting Confirmation": 'bg-purple-500/10 text-purple-400 border-purple-500/10',
        "Faltou": 'bg-gray-500/10 text-gray-400 border-gray-500/10',
    }
    const icon = {
        Completed: <CheckCircle2 size={12} />,
        Pending: <Clock size={12} />,
        Cancelled: <XCircle size={12} />,
        Confirmed: <CheckCircle2 size={12} />,
        "Awaiting Confirmation": <Clock size={12} />,
        "Faltou": <XCircle size={12} />,
    }
    const label = {
        Completed: 'Finalizado',
        Pending: 'Pendente',
        Cancelled: 'Cancelado',
        Confirmed: 'Confirmado',
        "Awaiting Confirmation": 'Aguardando Confirmação',
        "Faltou": 'Faltou',
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${styles[status] || styles.Pending} transition-colors`}>
            {icon[status]}
            {label[status] || status}
        </span>
    )
}

export default StatusBadge