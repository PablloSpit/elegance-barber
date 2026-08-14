import Header from "../Components/Header"
import Landing from '../assets/contact-bg.webp'
import AppointmentFormContact from "../Components/AppointmentFormContact"
import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'

function Contact() {
    const { t } = useTranslation()
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="bg-obsidian min-h-screen">
            <Header bgImage="bg-obsidian" />

            {/* Hero Section with Parallax Effect */}
            <main className="relative h-[45vh] sm:h-[60vh] md:h-[55vh] lg:h-[65vh] overflow-hidden">
                {/* Background Image with Parallax */}
                <div
                    className="absolute inset-0 z-0 scale-110"
                    style={{
                        transform: `translateY(${scrollY * 0.3}px)`,
                        backgroundImage: `url(${Landing})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 30%'
                    }}
                >
                    <div className="absolute inset-0 bg-linear-to-b from-obsidian/80 via-obsidian/50 to-obsidian"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-champberry/30 to-transparent z-1"></div>

                {/* Main Content */}
                <div className="relative container mx-auto px-4 pt-24 pb-4 sm:pt-38 sm:pb-18 md:pt-32 md:pb-12 lg:pt-38 lg:pb-22 z-10 flex justify-center items-center h-full text-center">
                    <h1
                        className="font-black text-5xl sm:text-[10vw] lg:text-[7vw] shadow-md tracking-widest uppercase leading-tight"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.68) 50%, rgba(0, 0, 0, 0.28) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                        }}
                    >{t('contact.title')}</h1>
                </div>
            </main>
            <section className="bg-obsidian">
                <div className="container mx-auto pt-16 pb-18 px-4 flex justify-center items-center flex-col">
                    <div className="section-text text-center space-y-2">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight"><span className="text-champberry">{t('contact.ready_for', 'PRONTO PARA')}</span> {t('contact.new_look', 'UM NOVO VISUAL')}</h2>
                        <p className="text-base sm:text-lg text-champberry-muted">{t('contact.subtitle')}</p>
                    </div>
                    <AppointmentFormContact />
                </div>
            </section>
        </div>
    )
}

export default Contact;
