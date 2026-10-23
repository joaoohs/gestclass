import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login({ aviso }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    try {
      await signInWithEmailAndPassword(auth, email, senha)
    } catch {
      setErro('E-mail ou senha incorretos. Confira os dados e tente de novo.')
    }
  }

  return (
    <div className="login">
      <form className="card" onSubmit={entrar}>
        <div className="logo" style={{ color: '#1F6F6B' }}>GestClass</div>
        <p className="sub">Acesso da direção e da secretaria</p>
        <label className="f">E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label className="f">Senha
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </label>
        {(erro || aviso) && <p className="erro">{erro || aviso}</p>}
        <button className="btn">Entrar</button>
      </form>
    </div>
  )
}