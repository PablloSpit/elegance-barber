import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../Context/AuthContext.jsx'
import { useMessage } from '../Context/MessageContext.jsx'
import { Link } from 'react-router-dom'

function RegisterInput() {
    const { t } = useTranslation()
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')

    const { register } = useAuth()
    const { showMessage } = useMessage()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            showMessage('error', 'As senhas não coincidem.');
            return
        }
        if (phone.length < 10) {
            showMessage('error', 'O número de telefone deve ter pelo menos 10 dígitos.');
            return
        }
        if (password.length < 6) {
            showMessage('error', 'A senha deve ter pelo menos 6 caracteres.');
            return
        }
        const result = await register({ fullname, email, phone, password });
        if (result.success) {
            showMessage('success', 'Cadastro realizado com sucesso! Você já pode fazer login.')
            setFullname('')
            setEmail('')
            setPhone('')
            setPassword('')
            setConfirmPassword('')
        }
        else {
            showMessage('error', result.error || 'Erro ao realizar cadastro.')
        }
    }
    return (
        <div className="register-box flex flex-col rounded-md shadow-lg text-white w-full max-w-2xl mx-auto scale-88">
            <div className="head bg-obsidian-elevated p-6 text-center rounded-t-2xl text-champberry text-2xl md:text-4xl font-black" style={{ textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)" }}>
                <h2>Criar Sua Conta</h2>
            </div>
            <div className="register-form bg-obsidian-surface rounded-b-2xl pb-3">
                <form className='px-5 md:px-9 py-6' onSubmit={handleSubmit} method="post">
                    <div className="input-forms space-y-6 mb-2">
                        <input type="text" placeholder="NOME COMPLETO" value={fullname} id='fullname' onChange={(e) => setFullname(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4  py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champberry transition-colors focus:outline-none focus:border-champberry rounded-md" required />
                        <input type="email" placeholder="E-MAIL" value={email} id='email' onChange={(e) => setEmail(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4  py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champberry transition-colors focus:outline-none focus:border-champberry rounded-md" required />
                        <input type="tel" placeholder="TELEFONE" value={phone} id='phone' onChange={(e) => setPhone(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4  py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champberry transition-colors focus:outline-none focus:border-champberry rounded-md" required />
                        <input type="password" placeholder="SENHA" id='password' value={password} onChange={(e) => setPassword(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champberry transition-colors focus:outline-none focus:border-champberry rounded-md" required />
                        <input type="password" placeholder="CONFIRMAR SENHA" id='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full font-black border-4 border-[#454545] p-2 px-3 sm:px-4 py-3 text-sm sm:text-base placeholder-[#454545] text-[#dddddd] tracking-tight hover:border-champberry transition-colors focus:outline-none focus:border-champberry rounded-md" required />
                    </div>
                    <div className="submit-button mt-8">
                        <input type="submit" value="Criar Conta" className="w-full border-4 sm:border-6 border-champberry hover:border-white text-white font-black p-2 sm:p-3 px-4 sm:px-6 hover:bg-[#d28127] transition-colors cursor-pointer uppercase text-base sm:text-lg md:text-xl" />
                    </div>
                    {message && <p className="mt-3 text-center text-champberry">{message}</p>}
                    <div className="no-account mt-4 sm:mt-5 md:mt-6">
                        <p className="text-center font-bold text-xs sm:text-sm md:text-base text-[#454545] tracking-tighter">Já tem uma conta? <Link to="/login" className='text-champberry'>Entrar</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterInput
