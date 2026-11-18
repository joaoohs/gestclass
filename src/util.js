import { useEffect, useState } from 'react'

export const TIPOS = [
  { valor: 'abono', nome: 'Abono', classe: 't1' },
  { valor: 'tre', nome: 'TRE', classe: 't2' },
  { valor: 'atestado', nome: 'Atestado', classe: 't3' },
]

const br = iso => iso.split('-').reverse().join('/')
export const formatarPeriodo = (ini, fim) => (!fim || fim === ini ? br(ini) : `${br(ini)} a ${br(fim)}`)

// Rejeita com code 'tempo-esgotado' se a promessa não terminar em `ms`.
export function comLimiteDeTempo(promessa, ms) {
  let timer
  const limite = new Promise((_, rejeitar) => {
    timer = setTimeout(() => rejeitar(Object.assign(new Error('Tempo esgotado'), { code: 'tempo-esgotado' })), ms)
  })
  return Promise.race([promessa, limite]).finally(() => clearTimeout(timer))
}

// Vira true se `ativo` continuar verdadeiro por mais de `ms` (para avisar de lentidão).
export function useDemora(ativo, ms = 15000) {
  const [demorou, setDemorou] = useState(false)
  useEffect(() => {
    setDemorou(false)
    if (!ativo) return
    const t = setTimeout(() => setDemorou(true), ms)
    return () => clearTimeout(t)
  }, [ativo, ms])
  return demorou
}

// '2026-11' -> 'novembro de 2026'
export const nomeDoMes = am => {
  const [a, m] = am.split('-').map(Number)
  return new Date(a, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
