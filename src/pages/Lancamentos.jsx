import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { mensagemDeErro } from '../contas'
import { TIPOS, formatarPeriodo, useDemora } from '../util'

export default function Lancamentos() {
  const [itens, setItens] = useState(null) // null = ainda carregando
  const [erro, setErro] = useState('')
  const demorando = useDemora(itens === null && !erro)
  const [fProf, setFProf] = useState('')
  const [fMes, setFMes] = useState('')
  const [fTipo, setFTipo] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'lancamentos'), orderBy('criadoEm', 'desc'))
    return onSnapshot(q, s => { setItens(s.docs.map(d => ({ id: d.id, ...d.data() }))); setErro('') },
      e => setErro('Não foi possível carregar os lançamentos. ' + mensagemDeErro(e)))
  }, [])

  const lista = itens ?? []
  const professores = useMemo(() => [...new Set(lista.map(i => i.professorNome))].sort(), [itens])
  const meses = useMemo(() => [...new Set(lista.map(i => i.dataInicio?.slice(0, 7)).filter(Boolean))].sort().reverse(), [itens])
  const filtrados = lista.filter(i =>
    (!fProf || i.professorNome === fProf) &&
    (!fMes || i.dataInicio?.startsWith(fMes)) &&
    (!fTipo || i.tipo === fTipo))

  return (
    <>
      <div className="top">
        <div><h1>Lançamentos</h1><p className="sub">Abonos, TREs e atestados dos professores</p></div>
        <Link to="/novo" className="btn">+ Novo lançamento</Link>
      </div>
      <div className="card row">
        <label className="f">Professor(a)
          <select value={fProf} onChange={e => setFProf(e.target.value)}>
            <option value="">Todos</option>{professores.map(p => <option key={p}>{p}</option>)}
          </select></label>
        <label className="f">Mês
          <select value={fMes} onChange={e => setFMes(e.target.value)}>
            <option value="">Todos</option>{meses.map(m => <option key={m}>{m}</option>)}
          </select></label>
        <label className="f">Tipo
          <select value={fTipo} onChange={e => setFTipo(e.target.value)}>
            <option value="">Todos</option>{TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.nome}</option>)}
          </select></label>
      </div>
      {erro && <p className="erro">{erro}</p>}
      <div className="card tw">
        <table>
          <thead><tr><th>Professor(a)</th><th>Tipo</th><th>Período</th><th>Documento entregue</th><th>Protocolo</th></tr></thead>
          <tbody>
            {filtrados.map(i => {
              const t = TIPOS.find(x => x.valor === i.tipo) ?? { classe: '', nome: i.tipo }
              return (
                <tr key={i.id}>
                  <td>{i.professorNome}</td>
                  <td><span className={`tag ${t.classe}`}>{t.nome}</span></td>
                  <td>{formatarPeriodo(i.dataInicio, i.dataFim)}</td>
                  <td>{i.documentoEntregue ? 'Sim' : 'Não'}</td>
                  <td>{i.protocolo || '—'}</td>
                </tr>
              )
            })}
            {itens === null && !erro && (
              <tr><td colSpan="5" className="note">
                {demorando ? 'O servidor está demorando para responder. Verifique a conexão com a internet…' : 'Carregando lançamentos…'}
              </td></tr>
            )}
            {itens !== null && !filtrados.length && <tr><td colSpan="5" className="note">Nenhum lançamento encontrado. Use “Novo lançamento” para registrar o primeiro.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
