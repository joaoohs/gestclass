import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import Login from './pages/Login.jsx'
import Lancamentos from './pages/Lancamentos.jsx'
import NovoLancamento from './pages/NovoLancamento.jsx'
import Relatorios from './pages/Relatorios.jsx'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = ainda carregando
  const [aviso, setAviso] = useState('')

  useEffect(() => onAuthStateChanged(auth, async u => {
    if (!u) return setUser(null)
    try {
      const s = await getDoc(doc(db, 'usuarios', u.uid))
      if (!s.exists()) {
        setAviso('Este usuário não tem autorização. Procure a direção da escola.')
        return signOut(auth)
      }
      setAviso('')
      setUser(u)
    } catch {
      setAviso('Não foi possível verificar o acesso. Tente novamente.')
      signOut(auth)
    }
  }), [])

  if (user === undefined) return <p className="note" style={{ padding: 32 }}>Carregando…</p>
  if (!user) return <Login aviso={aviso} />

  return (
    <div className="app">
      <aside className="side">
        <div className="logo">GestClass</div>
        <div className="school">Escola Classe 2</div>
        <NavLink to="/" end className="nav">Lançamentos</NavLink>
        <NavLink to="/novo" className="nav">Novo lançamento</NavLink>
        <NavLink to="/relatorios" className="nav">Relatórios</NavLink>
        <button className="nav sair" onClick={() => signOut(auth)}>Sair</button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Lancamentos />} />
          <Route path="/novo" element={<NovoLancamento />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}