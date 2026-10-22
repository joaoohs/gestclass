import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { TIPOS, formatarPeriodo } from '../util'

export default function Relatorios() {
  const [itens, setItens] = useState([])
  const [mes, setMes] = useState('')

  useEffect(() => onSnapshot(collection(db, 'lancamentos'), s => setItens(s.docs.map(d => d.data()))), [])

  const meses = useMemo(() => [...new Set(itens.map(i => i.dataInicio.slice(0, 7)))].sort().reverse(), [itens])
  const doMes = useMemo(() => itens.filter(i => !mes || i.dataInicio.startsWith(mes)), [itens, mes])
  const porProf = useMemo(() => {
    const m = {}
    doMes.forEach(i => {
      m[i.professorNome] ??= { abono: 0, tre: 0, atestado: 0 }
      m[i.professorNome][i.tipo]++
    })
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b))
  }, [doMes])

  function baixarCsv() {
    const linhas = [['Professor', 'Tipo', 'Período', 'Documento entregue', 'Protocolo', 'Observação']]
    doMes.forEach(i => linhas.push([i.professorNome, TIPOS.find(t => t.valor === i.tipo).nome,
      formatarPeriodo(i.dataInicio, i.dataFim), i.documentoEntregue ? 'Sim' : 'Não', i.protocolo, i.observacao]))
    const csv = linhas.map(l => l.map(c => `"${String(c ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `gestclass-${mes || 'todos'}.csv`
    a.click()
  }

  return (
    <>
      <div className="top"><div><h1>Relatórios</h1><p className="sub">Resumo para apoiar os processos junto à SEEDF</p></div></div>
      <div className="card row noprint">
        <label className="f">Mês
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option value="">Todos</option>{meses.map(m => <option key={m}>{m}</option>)}
          </select></label>
        <button className="btn2" onClick={baixarCsv}>Exportar planilha (CSV)</button>
        <button className="btn" onClick={() => window.print()}>Imprimir / salvar em PDF</button>
      </div>
      <div className="card tw">
        <table>
          <thead><tr><th>Professor(a)</th><th>Abonos</th><th>TREs</th><th>Atestados</th></tr></thead>
          <tbody>
            {porProf.map(([nome, c]) => <tr key={nome}><td>{nome}</td><td>{c.abono}</td><td>{c.tre}</td><td>{c.atestado}</td></tr>)}
            {!porProf.length && <tr><td colSpan="4" className="note">Sem lançamentos no período selecionado.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
