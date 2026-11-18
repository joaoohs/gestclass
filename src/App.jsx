import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import { garantirPerfil, mensagemDeErro, sair } from './contas'
import { useDemora } from './util'
import Login from './pages/Login.jsx'
import Lancamentos from './pages/Lancamentos.jsx'
import NovoLancamento from './pages/NovoLancamento.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Usuarios from './pages/Usuarios.jsx'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = ainda carregando
  const [perfil, setPerfil] = useState(undefined)
  const [erro, setErro] = useState('')
  const demorando = useDemora(!!user && !perfil && !erro)

  useEffect(() => onAuthStateChanged(auth, u => {
    setUser(u); setPerfil(undefined); setErro('')
  }), [])

  // Acompanha o perfil em tempo real: a aprovação pela direção libera o acesso na hora.
  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'usuarios', user.uid), { includeMetadataChanges: true }, s => {
      // Espera o servidor confirmar o perfil recém-criado; antes disso as regras ainda o desconhecem.
      if (s.metadata.hasPendingWrites) return
      if (s.exists()) {
        const d = s.data()
        // Perfis antigos, criados à mão sem status/papel, valem como aprovados e membros.
        setPerfil({ id: s.id, ...d, status: d.status ?? 'aprovado', papel: d.papel ?? 'membro' })
      } else {
        // Conta sem perfil (ex.: cadastro interrompido): cria agora.
        garantirPerfil(user).catch(e => setErro(mensagemDeErro(e)))
      }
    }, e => setErro(mensagemDeErro(e)))
  }, [user])

  if (user === undefined) return <p className="note" style={{ padding: 32 }}>Carregando…</p>
  if (!user) return <Login />

  if (!perfil) {
    return (
      <Aviso titulo={erro ? 'Não foi possível carregar sua conta' : 'Carregando sua conta…'}>
        {erro && <p className="erro">{erro}</p>}
        {demorando && <p className="note">O servidor está demorando para responder. Verifique a conexão com a internet.</p>}
      </Aviso>
    )
  }
  if (perfil.status === 'pendente') {
    return (
      <Aviso titulo="Aguardando aprovação">
        <p>Olá, {perfil.nome}! Sua conta foi criada. Assim que a direção aprovar o acesso, esta tela abre o sistema sozinha.</p>
      </Aviso>
    )
  }
  if (perfil.status !== 'aprovado') {
    return (
      <Aviso titulo="Acesso não autorizado">
        <p>Esta conta não tem acesso ao GestClass. Em caso de dúvida, procure a direção da escola.</p>
      </Aviso>
    )
  }

  const admin = perfil.papel === 'admin'
  return (
    <div className="app">
      <aside className="side">
        <div className="logo">GestClass</div>
        <div className="school">Escola Classe 2</div>
        <NavLink to="/" end className="nav">Lançamentos</NavLink>
        <NavLink to="/novo" className="nav">Novo lançamento</NavLink>
        <NavLink to="/relatorios" className="nav">Relatórios</NavLink>
        {admin && <NavLink to="/usuarios" className="nav">Usuários<Pendentes /></NavLink>}
        <div className="quem">
          <strong>{perfil.nome}</strong>
          <span>{admin ? 'Administrador(a)' : 'Membro'}</span>
        </div>
        <button className="nav sair" onClick={sair}>Sair</button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Lancamentos />} />
          <Route path="/novo" element={<NovoLancamento />} />
          <Route path="/relatorios" element={<Relatorios />} />
          {admin && <Route path="/usuarios" element={<Usuarios eu={user.uid} />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function Aviso({ titulo, children }) {
  return (
    <div className="login">
      <div className="card">
        <div className="logo" style={{ color: '#1F6F6B' }}>GestClass</div>
        <h1 style={{ fontSize: 22 }}>{titulo}</h1>
        {children}
        <button className="btn2" onClick={sair}>Sair</button>
      </div>
    </div>
  )
}

function Pendentes() {
  const [n, setN] = useState(0)
  useEffect(() => onSnapshot(query(collection(db, 'usuarios'), where('status', '==', 'pendente')),
    s => setN(s.size), () => setN(0)), [])
  return n ? <span className="contador" aria-label={`${n} pendente(s)`}>{n}</span> : null
}
