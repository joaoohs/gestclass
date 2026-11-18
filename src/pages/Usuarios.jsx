import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { mensagemDeErro } from '../contas'

const STATUS = {
  pendente: { nome: 'Pendente', classe: 't2' },
  aprovado: { nome: 'Aprovado', classe: 't4' },
  recusado: { nome: 'Recusado', classe: 't3' },
}
const ORDEM = { pendente: 0, aprovado: 1, recusado: 2 }

export default function Usuarios({ eu }) {
  const [itens, setItens] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState('')

  useEffect(() => onSnapshot(collection(db, 'usuarios'),
    s => setItens(s.docs.map(d => {
      const x = d.data()
      return { id: d.id, ...x, status: x.status ?? 'aprovado', papel: x.papel ?? 'membro' }
    })),
    e => setErro(mensagemDeErro(e))), [])

  const lista = useMemo(() => [...itens].sort((a, b) =>
    ORDEM[a.status] - ORDEM[b.status] || String(a.nome).localeCompare(String(b.nome))), [itens])

  async function alterar(u, mudancas) {
    setErro(''); setSalvando(u.id)
    try {
      await updateDoc(doc(db, 'usuarios', u.id), {
        status: u.status, papel: u.papel, ...mudancas, atualizadoEm: serverTimestamp(), atualizadoPor: eu,
      })
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setSalvando('')
    }
  }

  return (
    <>
      <div className="top"><div><h1>Usuários</h1><p className="sub">Aprove quem pode acessar o GestClass</p></div></div>
      {erro && <p className="erro">{erro}</p>}
      <div className="card tw">
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Situação</th><th>Papel</th><th>Ações</th></tr></thead>
          <tbody>
            {lista.map(u => {
              const st = STATUS[u.status] ?? STATUS.recusado
              const ocupado = salvando === u.id
              return (
                <tr key={u.id}>
                  <td>{u.nome}{u.id === eu && <span className="note"> (você)</span>}</td>
                  <td>{u.email}</td>
                  <td><span className={`tag ${st.classe}`}>{st.nome}</span></td>
                  <td>{u.papel === 'admin' ? 'Administrador(a)' : 'Membro'}</td>
                  <td>
                    {u.id === eu ? <span className="note">—</span> : (
                      <div className="acoes">
                        {u.status !== 'aprovado' && (
                          <button className="btn mini" disabled={ocupado} onClick={() => alterar(u, { status: 'aprovado' })}>Aprovar</button>
                        )}
                        {u.status !== 'recusado' && (
                          <button className="btn2 mini" disabled={ocupado}
                            onClick={() => alterar(u, { status: 'recusado', papel: 'membro' })}>
                            {u.status === 'aprovado' ? 'Bloquear' : 'Recusar'}
                          </button>
                        )}
                        {u.status === 'aprovado' && (
                          <button className="btn2 mini" disabled={ocupado}
                            onClick={() => alterar(u, { papel: u.papel === 'admin' ? 'membro' : 'admin' })}>
                            {u.papel === 'admin' ? 'Tirar admin' : 'Tornar admin'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {!lista.length && <tr><td colSpan="5" className="note">Nenhum usuário cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="note">Contas pendentes só entram no sistema depois de aprovadas. Você não pode alterar a própria conta.</p>
    </>
  )
}
