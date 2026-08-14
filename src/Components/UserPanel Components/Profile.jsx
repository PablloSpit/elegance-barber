import { useState } from 'react'
import { useAuth } from '../../Context/AuthContext.jsx'

import { useTranslation } from 'react-i18next'

function Profile() {
    const { t } = useTranslation()
    const { currentUser, updatedUser } = useAuth()

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.bio || ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isFadingOut, setIsFadingOut] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('success') // 'success' or 'error'

    // Helper function to show message with fade-out
    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setIsSubmitted(true)
        setIsFadingOut(false)

        setTimeout(() => setIsFadingOut(true), 2500)
        setTimeout(() => {
            setIsSubmitted(false)
            setIsFadingOut(false)
        }, 3000)
    }

    // Handle profile input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle profile submit
    const handleProfileSubmit = async (e) => {
        e.preventDefault()

        if (!currentUser) return
        
        try {
            const updatedUserData = {
                ...currentUser,
                name: profileData.name,
                phone: profileData.phone,
                bio: profileData.bio
            }
            const result = await updatedUser(updatedUserData)

            if (result.success) {
                showMessage(t('common.success_update', 'Perfil atualizado com sucesso!'), 'success')
            } else {
                showMessage(t('common.error_update', 'Erro ao atualizar perfil: ') + result.error, 'error')
            }
        } catch (error) {
            showMessage(t('common.error_update', 'Erro ao atualizar perfil: ') + error.message, 'error')
        }
    }

    return (
        <div className="bg-obsidian-surface px-6 sm:px-8 pb-12 sm:pb-14 shadow-lg rounded-lg transition-all duration-500" id='profile'>
            <div className="head-background bg-obsidian-elevated w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] -mx-6 sm:-mx-8 -mt-8 px-6 sm:px-8 py-6 sm:py-8 mb-6 rounded-t-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-champberry mt-1"><span className="text-white">{t('nav.account')}</span> e Configurações</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-champberry-muted font-semibold mb-1" htmlFor='name'>{t('admin.full_name', 'Nome Completo')}</label>
                        <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            placeholder={t('admin.full_name', 'Nome Completo')}
                            id='name'
                        />
                    </div>

                    <div>
                        <label className="block text-champberry-muted font-semibold mb-1" htmlFor='email'>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champberry-muted tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5 cursor-not-allowed"
                            id='email'
                            readOnly
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-champberry-muted font-semibold mb-1" htmlFor='phone'>{t('admin.phone_number', 'Telefone')}</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            placeholder="(00) 00000-0000"
                            id='phone'
                        />
                    </div>
                    <div>
                        <label className="block text-champberry-muted font-semibold mb-1" htmlFor='bio'>Bio / Recado</label>
                        <input
                            type="text"
                            name="bio"
                            value={profileData.bio}
                            onChange={handleProfileChange}
                            className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            placeholder="Sua bio curta"
                            id='bio'
                        />
                    </div>
                </div>

                <div className="border-t border-[#454545] pt-8">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{t('admin.professional_info', 'Segurança')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-champberry-muted font-semibold mb-1">Senha Atual</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            />
                        </div>
                        <div>
                            <label className="block text-champberry-muted font-semibold mb-1">Nova Senha</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            />
                        </div>
                        <div>
                            <label className="block text-champberry-muted font-semibold mb-1">Confirmar Senha</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full font-bold border-4 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-white tracking-tight bg-obsidian hover:border-champberry transition-colors focus:outline-none focus:border-champberry mt-1.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="px-8 py-4 bg-obsidian hover:bg-champberry text-white border-5 border-[#454545] hover:border-white font-extrabold rounded-md text-sm md:text-base transition-colors cursor-pointer focus:outline-none"
                    >
                        {t('common.save')}
                    </button>
                </div>
            </form>

            {isSubmitted && (
                <div className={`mt-6 p-4 rounded-lg border transition-all duration-500 ease-out transform ${isFadingOut
                    ? 'opacity-0 -translate-y-2.5'
                    : 'animate-fade-in opacity-100 translate-y-0'
                    } ${messageType === 'success'
                        ? 'bg-green-900/20 border-green-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {messageType === 'success' ? (
                                <svg className="w-4 h-4 text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <div className="transition-all duration-300">
                            <h3 className={`font-semibold transition-colors duration-300 ${messageType === 'success' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {messageType === 'success' ? 'Sucesso!' : 'Erro'}
                            </h3>
                            <p className={`text-sm transition-colors duration-300 ${messageType === 'success' ? 'text-green-300' : 'text-red-300'
                                }`}>
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
    )
}

export default Profile