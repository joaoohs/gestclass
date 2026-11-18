import { useState } from 'react'
import { criarConta, entrar, mensagemDeErro, recuperarSenha } from '../contas'

const TITULOS = {
  entrar: 'Acesso da direção e da secretaria',
  cadastrar: 'Crie sua conta. A direção precisa aprovar o acesso.',
  recuperar: 'Enviaremos um link para você criar uma nova senha.',
}

export default function Login() {
  const [modo, setModo] = useState('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  function trocar(m) {
    setModo(m); setErro(''); setOk(''); setSenha(''); setConfirmar('')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro(''); setOk('')
    if (modo === 'cadastrar') {
      if (!nome.trim()) return setErro('Digite seu nome.')
      if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
      if (senha !== confirmar) return setErro('As senhas não conferem.')
    }
    setEnviando(true)
    try {
      if (modo === 'entrar') await entrar(email, senha)
      else if (modo === 'cadastrar') await criarConta(nome, email, senha)
      else {
        await recuperarSenha(email)
        setOk('Se houver uma conta com este e-mail, o link de redefinição chegará em instantes. Confira também o spam.')
      }
    } catch (err) {
      // Por segurança, não revela se o e-mail existe ao recuperar a senha.
      if (modo === 'recuperar' && err?.code === 'auth/user-not-found') {
        setOk('Se houver uma conta com este e-mail, o link de redefinição chegará em instantes. Confira também o spam.')
      } else {
        setErro(mensagemDeErro(err))
      }
    } finally {
      setEnviando(false)
    }
  }

  const rotulo = { entrar: 'Entrar', cadastrar: 'Criar conta', recuperar: 'Enviar link' }[modo]

  return (
    <div className="login">
      <form className="card" onSubmit={enviar}>
        <div className="logo" style={{ color: '#1F6F6B' }}>GestClass</div>

        {modo !== 'recuperar' && (
          <div className="abas" role="tablist">
            <button type="button" role="tab" aria-selected={modo === 'entrar'}
              className={modo === 'entrar' ? 'aba ativa' : 'aba'} onClick={() => trocar('entrar')}>Entrar</button>
            <button type="button" role="tab" aria-selected={modo === 'cadastrar'}
              className={modo === 'cadastrar' ? 'aba ativa' : 'aba'} onClick={() => trocar('cadastrar')}>Criar conta</button>
          </div>
        )}
        <p className="sub">{TITULOS[modo]}</p>

        {modo === 'cadastrar' && (
          <label className="f">Nome completo
            <input value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" maxLength={100} required />
          </label>
        )}
        <label className="f">E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        {modo !== 'recuperar' && (
          <label className="f">Senha
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required
              minLength={modo === 'cadastrar' ? 6 : undefined}
              autoComplete={modo === 'cadastrar' ? 'new-password' : 'current-password'} />
          </label>
        )}
        {modo === 'cadastrar' && (
          <label className="f">Confirmar senha
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              autoComplete="new-password" required />
          </label>
        )}

        {erro && <p className="erro" role="alert">{erro}</p>}
        {ok && <p className="ok" role="status">{ok}</p>}

        <button className="btn" disabled={enviando}>{enviando ? 'Aguarde…' : rotulo}</button>

        {modo === 'entrar' && (
          <button type="button" className="link" onClick={() => trocar('recuperar')}>Esqueci minha senha</button>
        )}
        {modo === 'recuperar' && (
          <button type="button" className="link" onClick={() => trocar('entrar')}>Voltar para o login</button>
        )}
      </form>
    </div>
  )
}
