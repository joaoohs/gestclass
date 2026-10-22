import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { TIPOS } from '../util'

export default function NovoLancamento() {
  const nav = useNavigate()
  const [f, setF] = useState({ professorNome: '', tipo: 'abono', dataInicio: '', dataFim: '', observacao: '', documentoEntregue: false, protocolo: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const set = (campo, valor) => setF(old => ({ ...old, [campo]: valor }))

  async function salvar(e) {
    e.preventDefault()
    if (f.dataFim && f.dataFim < f.dataInicio) return setErro('A data final não pode ser anterior à data inicial.')
    setErro(''); setSalvando(true)
    try {
      await addDoc(collection(db, 'lancamentos'), {
        ...f,
        professorNome: f.professorNome.trim(),
        anexo: null, // reservado: será preenchido quando o armazenamento de anexos for definido
        criadoEm: serverTimestamp(),
        criadoPor: auth.currentUser.uid,
      })
      nav('/')
    } catch {
      setErro('Não foi possível salvar. Tente novamente.'); setSalvando(false)
    }
  }

  return (
    <>
      <div className="top"><div><h1>Novo lançamento</h1><p className="sub">Registre um abono, TRE ou atestado</p></div></div>
      <form className="card form" onSubmit={salvar}>
        <div className="row">
          <label className="f">Professor(a)
            <input value={f.professorNome} onChange={e => set('professorNome', e.target.value)} required /></label>
          <label className="f">Tipo
            <select value={f.tipo} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.nome}</option>)}
            </select></label>
        </div>
        <div className="row">
          <label className="f">Data inicial
            <input type="date" value={f.dataInicio} onChange={e => set('dataInicio', e.target.value)} required /></label>
          <label className="f">Data final
            <input type="date" value={f.dataFim} onChange={e => set('dataFim', e.target.value)} /></label>
        </div>
        <div className="row">
          <label className="f">Protocolo / identificação (opcional)
            <input value={f.protocolo} onChange={e => set('protocolo', e.target.value)} /></label>
          <label className="check">
            <input type="checkbox" checked={f.documentoEntregue} onChange={e => set('documentoEntregue', e.target.checked)} />
            Documento entregue à escola</label>
        </div>
        <label className="f">Observação (opcional)
          <textarea value={f.observacao} onChange={e => set('observacao', e.target.value)} /></label>
        <div className="anexo">Anexo digital do documento: disponível em breve</div>
        <p className="note">Não registre diagnóstico ou CID. Apenas a direção e a secretaria têm acesso a este registro.</p>
        {erro && <p className="erro">{erro}</p>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn2" onClick={() => nav('/')}>Cancelar</button>
          <button className="btn" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar lançamento'}</button>
        </div>
      </form>
    </>
  )
}
