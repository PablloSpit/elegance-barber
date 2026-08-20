import { useState, useRef, useEffect, memo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { services } from '../data/services.js'
import { useAppointment } from '../Context/AppointmentContext.jsx'
import { useStaff } from '../Context/StaffContext.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { useMessage } from '../Context/MessageContext.jsx'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/** =========================================================================
 *  STEP 1: THE SELECTION (Memoized to prevent WebGL background re-renders)
 *  ========================================================================= */
const Step1Selection = memo(({
    selectedService, toggleService, isOpen, setIsOpen,
    totalPrice, dropdownRef, onNext
}) => {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col gap-4">
            <div className="w-full relative" ref={dropdownRef}>
                {/* Custom Multi-Select Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full font-black border-2 md:border-5 p-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base tracking-tight bg-obsidian text-left flex justify-between items-center transition-colors ${isOpen ? 'border-champberry text-champberry' : 'border-[#454545] text-champberry-muted hover:border-champberry'
                            }`}
                    >
                        <span>
                            {selectedService.length === 0
                                ? t('appointments.select_services', 'SELECIONAR SERVIÇOS')
                                : `${selectedService.length} ${selectedService.length > 1 ? t('appointments.services_selected_plural', 'SERVIÇOS SELECIONADOS') : t('appointments.service_selected_singular', 'SERVIÇO SELECIONADO')}`}
                        </span>
                        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute top-full left-0 w-full bg-[#1b1b1b] border-2 md:border-5 border-champberry z-50 mt-1 max-h-60 md:max-h-70 overflow-y-auto">
                            {services.map((serviceCategory) => (
                                <div key={serviceCategory.title}>
                                    <div className="font-extrabold text-champberry bg-[#191919] px-3 md:px-4 py-2 text-xs md:text-sm tracking-wide uppercase">
                                        {t(`services.categories.${serviceCategory.title}`, serviceCategory.title)}
                                    </div>
                                    {serviceCategory.items.map((service) => {
                                        const isSelected = selectedService.some(s => s.name === service.name)
                                        return (
                                            <button
                                                key={service.name}
                                                type="button"
                                                onClick={() => toggleService(service)}
                                                className={`w-full text-left px-3 md:px-4 py-2 md:py-3 transition-colors font-black tracking-tight text-xs md:text-sm flex items-center justify-between gap-2 ${isSelected
                                                    ? 'bg-champberry/10 text-champberry'
                                                    : 'text-[#bfbdbd] hover:bg-champberry/5 hover:text-white'
                                                    }`}
                                            >
                                                <span>{t(`services.items.${service.name}`, service.name)} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}</span>
                                                <span className={`shrink-0 w-4 h-4 border-2 rounded-sm flex items-center justify-center text-[10px] transition-colors ${isSelected ? 'border-champberry bg-champberry text-black' : 'border-[#555]'
                                                    }`}>
                                                    {isSelected && '✓'}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Services Chips */}
                {selectedService.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedService.map(s => (
                            <span
                                key={s.name}
                                className="inline-flex items-center gap-1.5 bg-champberry/15 border border-champberry/40 text-champberry text-xs font-black px-2 py-1 rounded-sm tracking-tight"
                            >
                                {t(`services.items.${s.name}`, s.name)} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleService(s) }}
                                    className="text-champberry hover:text-white transition-colors leading-none"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {selectedService.length > 0 && (
                    <div className="mt-3 text-left text-sm font-black text-champberry-muted tracking-wide">
                        TOTAL: <span className="text-champberry text-lg">R$ {totalPrice}</span>
                    </div>
                )}
            </div>

            <div className="w-full mt-2">
                <button
                    type="button"
                    onClick={onNext}
                    className="w-full border-2 border-champberry/50 hover:border-champberry text-champberry font-black p-3 px-6 hover:bg-champberry hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest"
                >
                    {t('appointments.continue_schedule', 'Continuar para Agenda')}
                </button>
            </div>
        </div>
    )
})

/** =========================================================================
 *  STEP 2: THE SCHEDULE (Memoized Date & Time)
 *  ========================================================================= */
const Step2Schedule = memo(({
    date, setDate, time, setTime, onPrev, onNext
}) => {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full relative group">
                    <label className="absolute -top-3 left-3 bg-obsidian text-champberry px-1 text-[10px] font-bold uppercase tracking-widest z-10 transition-colors group-hover:text-white">{t('appointments.select_date', 'Selecionar Data')}</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
                </div>
                <div className="w-full relative group">
                    <label className="absolute -top-3 left-3 bg-obsidian text-champberry px-1 text-[10px] font-bold uppercase tracking-widest z-10 transition-colors group-hover:text-white">{t('appointments.choose_time', 'Escolher Horário')}</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
                </div>
            </div>

            <div className="flex gap-4 mt-2">
                <button
                    type="button"
                    onClick={onPrev}
                    className="w-1/3 border-2 border-[#454545] hover:border-white text-white/50 hover:text-white font-black p-3 transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs"
                >
                    {t('common.back', 'Voltar')}
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="w-2/3 border-2 border-champberry/50 hover:border-champberry text-champberry font-black p-3 hover:bg-champberry hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs"
                >
                    {t('appointments.final_details', 'Detalhes Finais')}
                </button>
            </div>
        </div>
    )
})

/** =========================================================================
 *  STEP 3: THE DETAILS (Memoized Personal Details)
 *  ========================================================================= */
const Step3Details = memo(({
    name, setName, email, setEmail, phoneNumber, setPhoneNumber, message, setMessage, onPrev, onSubmit
}) => {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col gap-4">
            <input type="text" placeholder={t('appointments.placeholders.name', 'NOME')} value={name} onChange={(e) => setName(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
            <input type="email" placeholder={t('appointments.placeholders.email', 'E-MAIL')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
            <input type="tel" placeholder={t('appointments.placeholders.phone', 'TELEFONE')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
            <textarea placeholder={t('appointments.placeholders.requests', 'PEDIDOS ADICIONAIS (OPCIONAL)')} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" rows={2} />

            <div className="flex gap-4 mt-2">
                <button
                    type="button"
                    onClick={onPrev}
                    className="w-1/3 border-2 border-[#454545] hover:border-white text-white/50 hover:text-white font-black p-3 transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs"
                >
                    {t('common.back', 'Voltar')}
                </button>
                <button
                    type="submit"
                    onClick={onSubmit}
                    className="w-2/3 border-5 border-champberry text-white font-black p-3 hover:bg-[#d28127] hover:border-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-sm"
                >
                    {t('appointments.confirm_booking', 'Confirmar Agendamento')}
                </button>
            </div>
        </div>
    )
})

/** =========================================================================
 *  MAIN COMPONENT (State Machine & GSAP Animations)
 *  ========================================================================= */
function Appointment() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const { staffSlug } = useParams()
    const { staff } = useStaff()
    
    // Identifica o funcionário pelo slug ou pelo parâmetro de busca
    const staffIdParam = staffSlug 
        ? staff.find(s => {
            const normalizedName = s.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            return normalizedName === staffSlug;
          })?.id
        : searchParams.get('staff')
    
    const [forcedStaff, setForcedStaff] = useState(null)
    
    useEffect(() => {
        if (staffIdParam) {
            // Se staffIdParam for um ID numérico ou o ID exato (UUID)
            let foundStaff = staff.find(s => s.id === parseInt(staffIdParam) || s.id.toString() === staffIdParam.toString());
            
            // Se não encontrou por ID, mas temos staffSlug (que gerou staffIdParam via busca por nome)
            if (!foundStaff && staffSlug) {
                foundStaff = staff.find(s => {
                    const normalizedName = s.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                    return normalizedName === staffSlug;
                });
            }

            if (foundStaff) {
                setForcedStaff(foundStaff)
            }
        } else {
            setForcedStaff(null)
        }
    }, [staffIdParam, staff, staffSlug])
    const { currentUser } = useAuth()
    const { showMessage } = useMessage()
    const { bookAppointment } = useAppointment()
    const { getStaffById } = useStaff()

    // Step State Machine
    const [currentStep, setCurrentStep] = useState(1)
    const containerRef = useRef(null)

    // Form Data State
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const [name, setName] = useState(currentUser ? currentUser.name : '')
    const [email, setEmail] = useState(currentUser ? currentUser.email : '')
    const [phoneNumber, setPhoneNumber] = useState(currentUser ? currentUser.phone : '')
    const [selectedService, setSelectedService] = useState([])
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [message, setMessage] = useState('')

    const totalPrice = selectedService.reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : parseFloat(s.price?.toString().replace('R$ ', '') || 0)), 0)

    const toggleService = (service) => {
        setSelectedService(prev => {
            const exists = prev.find(s => s.name === service.name)
            if (exists) return prev.filter(s => s.name !== service.name)
            return [...prev, { name: service.name, price: service.price }]
        })
    }

    // Advanced GSAP Step Transition Logic
    useGSAP(() => {
        const steps = gsap.utils.toArray('.form-step')
        const easeLuxury = "cubic-bezier(0.23, 1, 0.32, 1)"

        steps.forEach((step, index) => {
            const stepNum = index + 1
            if (stepNum === currentStep) {
                // Active step slides in from right
                gsap.fromTo(step,
                    { autoAlpha: 0, x: 30 },
                    { autoAlpha: 1, x: 0, duration: 0.8, ease: easeLuxury, force3D: true, display: 'block' }
                )
            } else if (stepNum < currentStep) {
                // Previous step fades out to left
                gsap.to(step, { autoAlpha: 0, x: -30, duration: 0.6, ease: easeLuxury, force3D: true, display: 'none' })
            } else {
                // Future step instantly prepared to right
                gsap.set(step, { autoAlpha: 0, x: 30, display: 'none' })
            }
        })
    }, { dependencies: [currentStep], scope: containerRef })

    // Step Validation Handlers
    const handleNextStep1 = () => {
        if (!name || !email || !phoneNumber) {
            showMessage('error', t('appointments.errors.details_required', 'Dados pessoais são obrigatórios.'))
            return
        }
        const phonePattern = /^(\d{2})?\d{9}$/
        if (!phonePattern.test(phoneNumber.replace(/\D/g, ''))) {
            showMessage('error', t('appointments.errors.invalid_phone', 'Por favor, insira um número de telefone válido.'))
            return
        }
        setCurrentStep(2)
    }

    const handleNextStep2 = () => {
        if (selectedService.length === 0) {
            showMessage('warning', t('appointments.errors.select_service', 'Por favor, selecione pelo menos um serviço para continuar.'))
            return
        }
        setCurrentStep(3)
    }

    const handleNextStep3 = () => {
        if (!date || !time) {
            showMessage('warning', t('appointments.errors.choose_datetime', 'Por favor, escolha uma data e hora válidas.'))
            return
        }
        if (date < new Date().toISOString().split('T')[0]) {
            showMessage('error', t('appointments.errors.past_date', 'Por favor, selecione uma data futura.'))
            return
        }
        if (time < '11:00' || time > '20:00') {
            showMessage('error', t('appointments.errors.outside_hours', 'Por favor, selecione um horário entre 11:00 e 20:00.'))
            return
        }
        const selectedDate = new Date(date)
        if (selectedDate.getDay() === 0) {
            showMessage('error', t('appointments.errors.sunday', 'Agendamentos não podem ser feitos aos domingos. Por favor, selecione outro dia.'))
            return
        }
        setCurrentStep(4)
    }

    // Final Submission Logic (Strictly maintains existing footprint)
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !email || !phoneNumber) {
            showMessage('error', t('appointments.errors.details_required', 'Dados pessoais são obrigatórios.'))
            return
        }
        const phonePattern = /^(\d{2})?\d{9}$/ // Basic Brazilian-friendly pattern
        if (!phonePattern.test(phoneNumber.replace(/\D/g, ''))) {
            showMessage('error', t('appointments.errors.invalid_phone', 'Por favor, insira um número de telefone válido.'))
            return
        }

        const formData = {
            name, 
            email, 
            phoneNumber, 
            selectedService, 
            date, 
            time, 
            message, 
            totalPrice,
            forcedStaffId: forcedStaff ? forcedStaff.id : (staffIdParam ? (isNaN(parseInt(staffIdParam)) ? staffIdParam : parseInt(staffIdParam)) : null),
            isStaffSpecific: !!(forcedStaff || staffIdParam)
        }

        const result = await bookAppointment(formData)
        if (result && result.success) {
            const assignmentSummary = result.assignments
                .map(a => `${a.service} → ${a.stylist}`)
                .join(', ')
            showMessage('success', t('appointments.success_msg', { summary: assignmentSummary }))

            // Reset form completely & return to Step 1
            setSelectedService([])
            setDate('')
            setTime('')
            setMessage('')
            setCurrentStep(1)
            
            // If it was a staff-specific link, clear the param to avoid confusing the user on next booking
            if (staffIdParam) {
                window.history.replaceState({}, '', window.location.pathname);
            }
        } else {
            showMessage('error', result?.error || 'An error occurred while booking.')
        }
    }

    // Dropdown Outside-Click Handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="w-full max-w-lg mx-auto bg-obsidian-surface/40 backdrop-blur-xl border-2 md:border-4 border-champberry/20 p-4 md:p-8 shadow-2xl relative overflow-hidden group rounded-2xl" ref={containerRef}>
            {/* Aesthetic Glow Effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-champberry/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-champberry/5 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">
                        {t('appointments.title', 'Agendamento')} <span className="text-champberry">{t('appointments.online', 'Online')}</span>
                    </h2>
                    <div className="h-1 w-20 bg-linear-to-r from-transparent via-champberry to-transparent mx-auto mt-2 rounded-full shadow-lg shadow-champberry/50"></div>
                    
                    {forcedStaff && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-champberry/10 border border-champberry/30 rounded-full text-champberry text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-champberry animate-pulse"></div>
                            {t('appointments.with_professional', 'Profissional')}: {forcedStaff.name}
                        </div>
                    )}
                </div>

                {/* Multi-Step Progress Indicator */}
                <div className="flex justify-between items-center mb-10 px-2 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-1"></div>
                    {[1, 2, 3, 4].map(num => (
                        <div
                            key={num}
                            className={`relative z-10 w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all duration-500 border-2 ${
                                currentStep >= num 
                                ? 'bg-champberry border-champberry text-white shadow-lg shadow-champberry/30' 
                                : 'bg-obsidian border-[#333] text-[#555]'
                            }`}
                        >
                            {num}
                            {currentStep === num && (
                                <div className="absolute -inset-2 border border-champberry/30 rounded-full animate-ping opacity-30"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="relative">
                {/* Step 1: Personal Details */}
                <div className="form-step hidden w-full">
                    <div className="flex flex-col gap-4">
                        <input type="text" placeholder={t('appointments.placeholders.name', 'NOME')} value={name} onChange={(e) => setName(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
                        <input type="email" placeholder={t('appointments.placeholders.email', 'E-MAIL')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
                        <input type="tel" placeholder={t('appointments.placeholders.phone', 'TELEFONE')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 text-sm md:text-base text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry" required />
                        
                        <button
                            type="button"
                            onClick={handleNextStep1}
                            className="w-full mt-2 border-2 border-champberry/50 hover:border-champberry text-champberry font-black p-3 hover:bg-champberry hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-sm"
                        >
                            {t('appointments.continue_services', 'Continuar para Serviços')}
                        </button>
                    </div>
                </div>

                {/* Step 2: Service Selection */}
                <div className="form-step hidden w-full">
                    <Step1Selection
                        selectedService={selectedService} toggleService={toggleService}
                        isOpen={isOpen} setIsOpen={setIsOpen}
                        totalPrice={totalPrice} dropdownRef={dropdownRef}
                        onNext={handleNextStep2}
                    />
                </div>

                {/* Step 3: Schedule */}
                <div className="form-step hidden w-full">
                    <Step2Schedule
                        date={date} setDate={setDate} time={time} setTime={setTime}
                        onPrev={() => setCurrentStep(2)} onNext={handleNextStep3}
                    />
                </div>

                {/* Step 4: Final Summary */}
                <div className="form-step hidden w-full">
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#191919] p-4 border border-champberry/20">
                            <h4 className="text-white font-black text-sm mb-2 uppercase tracking-widest">{t('appointments.summary', 'Resumo do Agendamento')}</h4>
                            <div className="space-y-1 text-xs md:text-sm">
                                <p><span className="text-champberry-muted">{t('appointments.client', 'Cliente')}:</span> <span className="text-white">{name}</span></p>
                                <p><span className="text-champberry-muted">{t('appointments.professional', 'Profissional')}:</span> <span className="text-champberry font-bold">{forcedStaff?.name || t('appointments.any_professional', 'Qualquer Profissional')}</span></p>
                                <p><span className="text-champberry-muted">{t('appointments.date', 'Data')}:</span> <span className="text-white">{date} às {time}</span></p>
                                <p><span className="text-champberry-muted">{t('appointments.services', 'Serviços')}:</span> <span className="text-white">{selectedService.map(s => t(`services.items.${s.name}`, s.name)).join(', ')}</span></p>
                                <p className="pt-2 border-t border-white/5 mt-2 flex justify-between">
                                    <span className="text-white font-black">{t('appointments.total', 'TOTAL')}:</span>
                                    <span className="text-champberry font-black">R$ {totalPrice}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(3)}
                                className="w-1/3 border-2 border-[#454545] hover:border-white text-white/50 hover:text-white font-black p-3 transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs"
                            >
                                {t('common.back', 'Voltar')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-2/3 border-5 border-champberry text-white font-black p-3 hover:bg-[#d28127] hover:border-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-sm"
                            >
                                {t('appointments.confirm_booking', 'Confirmar Agendamento')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Appointment
