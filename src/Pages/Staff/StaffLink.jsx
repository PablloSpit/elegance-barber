import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../Context/AuthContext'
import { useMessage } from '../../Context/MessageContext'
import { Globe, Copy, Check } from 'lucide-react'

function StaffLink() {
    const { t } = useTranslation()
    const { currentUser } = useAuth()
    const { showMessage } = useMessage()
    const [copied, setCopied] = useState(false)

    const slug = currentUser?.name ? currentUser.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') : currentUser?.id
    const bookingLink = `${window.location.origin}/agendar/${slug}`

    const handleCopy = () => {
        navigator.clipboard.writeText(bookingLink)
        setCopied(true)
        showMessage('success', t('admin.booking_link_copied', 'Link de agendamento copiado!'))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-0">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {t('nav.my_link', 'Meu')} <span className="text-champberry">{t('nav.link', 'Link')}</span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('profile.booking_link_desc', 'Use este link para receber agendamentos diretamente para você.')}</p>
            </div>

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-champberry/10 rounded-3xl flex items-center justify-center text-champberry mb-2">
                        <Globe size={40} />
                    </div>
                    
                    <div className="space-y-2 max-w-2xl">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t('profile.share_link', 'Compartilhe seu Perfil')}</h2>
                        <p className="text-gray-400 text-sm">
                            {t('profile.share_link_instruction', 'Envie este link para seus clientes para que eles possam agendar serviços diretamente com você. O sistema identificará automaticamente sua disponibilidade.')}
                        </p>
                    </div>

                    <div className="w-full max-w-lg bg-obsidian-elevated border border-[#333] rounded-xl p-4 flex items-center gap-3">
                        <div className="flex-1 truncate text-champberry-muted text-sm font-mono">
                            {bookingLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 p-2 bg-champberry hover:bg-champberry-dark text-white rounded-lg transition-all active:scale-95 cursor-pointer"
                            title={t('common.copy_link', 'Copiar Link')}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-left">
                            <h3 className="text-white font-bold text-xs uppercase mb-1">{t('profile.automatic_id', 'Identificação Automática')}</h3>
                            <p className="text-[#777] text-[10px]">{t('profile.automatic_id_desc', 'O link contém seu ID único, garantindo que o agendamento seja vinculado a você.')}</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-left">
                            <h3 className="text-white font-bold text-xs uppercase mb-1">{t('profile.direct_access', 'Acesso Direto')}</h3>
                            <p className="text-[#777] text-[10px]">{t('profile.direct_access_desc', 'O link rola automaticamente para a seção de agendamento na página inicial.')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffLink
