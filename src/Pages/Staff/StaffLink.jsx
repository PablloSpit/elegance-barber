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

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10">
                <div className="flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-champberry/20 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-linear-to-br from-champberry to-champberry-dark rounded-3xl flex items-center justify-center text-white shadow-xl shadow-champberry/20 rotate-3">
                            <Globe size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                    
                    <div className="space-y-3 max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">
                            {t('profile.share_link', 'Seu Canal de Vendas Direto')}
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                            {t('profile.share_link_instruction', 'Este é o seu link exclusivo e profissional. Ao clicar, o cliente abre uma página de agendamento dedicada onde VOCÊ já está selecionado como profissional. Ideal para sua bio do Instagram e WhatsApp.')}
                        </p>
                    </div>

                    <div className="w-full max-w-xl group relative">
                        <div className="absolute -inset-1 bg-linear-to-r from-champberry/30 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-obsidian border-2 border-champberry/30 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 shadow-inner">
                            <div className="flex-1 truncate text-champberry font-mono text-base md:text-lg font-bold tracking-tight w-full md:w-auto">
                                {bookingLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="w-full md:w-auto px-6 py-4 bg-champberry hover:bg-champberry-dark text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-champberry/20 cursor-pointer flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        <span>Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Copiar Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-left space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-champberry mb-1">
                                <Check size={16} />
                            </div>
                            <h3 className="text-white font-bold text-xs uppercase tracking-wider">{t('profile.automatic_id', 'Identificação')}</h3>
                            <p className="text-gray-500 text-[10px] leading-normal">{t('profile.automatic_id_desc', 'Seu nome já vai bloqueado no formulário, garantindo que o agendamento caia na sua agenda.')}</p>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-left space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-champberry mb-1">
                                <Globe size={16} />
                            </div>
                            <h3 className="text-white font-bold text-xs uppercase tracking-wider">{t('profile.direct_access', 'Página Única')}</h3>
                            <p className="text-gray-500 text-[10px] leading-normal">{t('profile.direct_access_desc', 'O link abre uma página limpa e focada exclusivamente no processo de agendamento.')}</p>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-left space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-champberry mb-1">
                                <Star size={16} />
                            </div>
                            <h3 className="text-white font-bold text-xs uppercase tracking-wider">{t('profile.professional_brand', 'Marca Pessoal')}</h3>
                            <p className="text-gray-500 text-[10px] leading-normal">{t('profile.professional_brand_desc', 'URL personalizada com seu nome para transmitir mais credibilidade aos seus clientes.')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffLink
