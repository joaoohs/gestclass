import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { mensagemDeErro } from '../contas'
import { TIPOS, formatarPeriodo, nomeDoMes } from '../util'

const nomeTipo = valor => TIPOS.find(t => t.valor === valor)?.nome ?? valor

export default function Relatorios() {
  const [itens, setItens] = useState(null) // null = ainda carregando
  const [erro, setErro] = useState('')
  const [mes, setMes] = useState('')
  const [gerando, setGerando] = useState(false)

  useEffect(() => onSnapshot(collection(db, 'lancamentos'),
    s => { setItens(s.docs.map(d => d.data())); setErro('') },
    e => setErro('Não foi possível carregar os lançamentos. ' + mensagemDeErro(e))), [])

  const lista = itens ?? []
  const meses = useMemo(() => [...new Set(lista.map(i => i.dataInicio?.slice(0, 7)).filter(Boolean))].sort().reverse(), [itens])
  const doMes = useMemo(() => lista
    .filter(i => !mes || i.dataInicio?.startsWith(mes))
    .sort((a, b) => String(a.dataInicio).localeCompare(String(b.dataInicio)) || String(a.professorNome).localeCompare(String(b.professorNome))),
  [itens, mes])
  const porProf = useMemo(() => {
    const m = {}
    doMes.forEach(i => {
      m[i.professorNome] ??= { abono: 0, tre: 0, atestado: 0 }
      if (i.tipo in m[i.professorNome]) m[i.professorNome][i.tipo]++
    })
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b))
  }, [doMes])
  const totais = porProf.reduce((t, [, c]) => ({ abono: t.abono + c.abono, tre: t.tre + c.tre, atestado: t.atestado + c.atestado }),
    { abono: 0, tre: 0, atestado: 0 })
  const periodo = mes ? nomeDoMes(mes) : 'Todos os meses'

  function baixar(blob, nome) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = nome
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  function baixarCsv() {
    const linhas = [['Professor', 'Tipo', 'Período', 'Documento entregue', 'Protocolo', 'Observação']]
    doMes.forEach(i => linhas.push([i.professorNome, nomeTipo(i.tipo),
      formatarPeriodo(i.dataInicio, i.dataFim), i.documentoEntregue ? 'Sim' : 'Não', i.protocolo, i.observacao]))
    const csv = linhas.map(l => l.map(c => `"${String(c ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')
    baixar(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `gestclass-${mes || 'todos'}.csv`)
  }

  async function baixarPdf() {
    setGerando(true); setErro('')
    try {
      // Carregadas só quando precisa, para não pesar na abertura do sistema.
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const verde = [31, 111, 107]
      const largura = pdf.internal.pageSize.getWidth()

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18); pdf.setTextColor(...verde)
      pdf.text('GestClass', 14, 18)
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(40)
      pdf.text('Relatório de abonos, TREs e atestados - Escola Classe 2', 14, 25)
      pdf.setFontSize(10); pdf.setTextColor(90)
      pdf.text(`Período: ${periodo}`, 14, 31)
      pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`, largura - 14, 31, { align: 'right' })

      const estilo = {
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2, textColor: 30 },
        headStyles: { fillColor: verde, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [246, 247, 244] },
        margin: { left: 14, right: 14 },
      }

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(30)
      pdf.text('Resumo por professor(a)', 14, 41)
      autoTable(pdf, {
        ...estilo,
        startY: 44,
        head: [['Professor(a)', 'Abonos', 'TREs', 'Atestados', 'Total']],
        body: porProf.length
          ? porProf.map(([nome, c]) => [nome, c.abono, c.tre, c.atestado, c.abono + c.tre + c.atestado])
          : [['Sem lançamentos no período', '', '', '', '']],
        foot: porProf.length
          ? [['Total', totais.abono, totais.tre, totais.atestado, totais.abono + totais.tre + totais.atestado]]
          : undefined,
        footStyles: { fillColor: [221, 228, 224], textColor: 30, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
        // Cabeçalho e total centralizados como os números.
        didParseCell: d => { if (d.section !== 'body' && d.column.index > 0) d.cell.styles.halign = 'center' },
      })

      if (doMes.length) {
        const y = pdf.lastAutoTable.finalY + 10
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(30)
        pdf.text('Lançamentos do período', 14, y)
        autoTable(pdf, {
          ...estilo,
          startY: y + 3,
          head: [['Professor(a)', 'Tipo', 'Período', 'Doc. entregue', 'Protocolo', 'Observação']],
          body: doMes.map(i => [i.professorNome, nomeTipo(i.tipo), formatarPeriodo(i.dataInicio, i.dataFim),
            i.documentoEntregue ? 'Sim' : 'Não', i.protocolo || '-', i.observacao || '-']),
          columnStyles: { 3: { halign: 'center' }, 5: { cellWidth: 50 } },
        })
      }

      const paginas = pdf.getNumberOfPages()
      for (let p = 1; p <= paginas; p++) {
        pdf.setPage(p)
        const altura = pdf.internal.pageSize.getHeight()
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(120)
        pdf.text('Documento de uso interno. Não contém diagnóstico nem CID.', 14, altura - 8)
        pdf.text(`Página ${p} de ${paginas}`, largura - 14, altura - 8, { align: 'right' })
      }

      baixar(pdf.output('blob'), `gestclass-relatorio-${mes || 'todos'}.pdf`)
    } catch (e) {
      console.error(e)
      setErro('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <>
      <div className="top"><div><h1>Relatórios</h1><p className="sub">Resumo para apoiar os processos junto à SEEDF</p></div></div>
      <div className="card row noprint">
        <label className="f">Mês
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option value="">Todos</option>{meses.map(m => <option key={m} value={m}>{nomeDoMes(m)}</option>)}
          </select></label>
        <button className="btn2" onClick={baixarCsv} disabled={!itens}>Exportar planilha (CSV)</button>
        <button className="btn2" onClick={() => window.print()} disabled={!itens}>Imprimir</button>
        <button className="btn" onClick={baixarPdf} disabled={!itens || gerando}>{gerando ? 'Gerando PDF…' : 'Baixar PDF'}</button>
      </div>
      {erro && <p className="erro">{erro}</p>}
      <div className="card tw">
        <table>
          <thead><tr><th>Professor(a)</th><th>Abonos</th><th>TREs</th><th>Atestados</th><th>Total</th></tr></thead>
          <tbody>
            {porProf.map(([nome, c]) => (
              <tr key={nome}><td>{nome}</td><td>{c.abono}</td><td>{c.tre}</td><td>{c.atestado}</td><td>{c.abono + c.tre + c.atestado}</td></tr>
            ))}
            {itens === null && !erro && <tr><td colSpan="5" className="note">Carregando…</td></tr>}
            {itens !== null && !porProf.length && <tr><td colSpan="5" className="note">Sem lançamentos no período selecionado.</td></tr>}
          </tbody>
          {porProf.length > 0 && (
            <tfoot><tr className="total"><td>Total</td><td>{totais.abono}</td><td>{totais.tre}</td><td>{totais.atestado}</td>
              <td>{totais.abono + totais.tre + totais.atestado}</td></tr></tfoot>
          )}
        </table>
      </div>
    </>
  )
}
