import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../Components/Header'
import AppointmentForm from '../Components/AppointmentForm'
import Landing from '../assets/Landing.webp'
import HeroCanvas from '../Components/HeroCanvas'

function BookingPage() {
    const { t } = useTranslation()
    const { staffSlug } = useParams()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen bg-obsidian flex flex-col">
            <Header bgImage="bg-obsidian/95" />
            
            <main className="flex-1 relative pt-20 md:pt-28 pb-12 md:pb-20">
                {/* Background Image Layer */}
                <div 
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url(${Landing})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                ></div>
                
                {/* 3D Embers Effect */}
                <HeroCanvas />

                {/* Content Overlay */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="text-center mb-10 md:mb-16">
                            <span className="font-sans text-champberry/70 tracking-[0.5em] text-xs uppercase mb-3 block">
                                {t('nav.book_now')}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-6">
                                {t('home.appointment_title')} <span className="font-serif italic text-champberry normal-case">{t('home.appointment_subtitle')}</span>
                            </h1>
                            <div className="w-24 h-1 bg-champberry/30 mx-auto rounded-full"></div>
                        </div>

                        {/* Booking Form Container */}
                        <div className="bg-obsidian-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-1 md:p-8 shadow-2xl overflow-hidden">
                            <AppointmentForm />
                        </div>

                        {/* Footer Info */}
                        <div className="mt-12 text-center">
                            <p className="text-white/40 font-sans text-sm tracking-widest uppercase">
                                {t('home.since')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BookingPage
