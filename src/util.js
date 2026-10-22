export const TIPOS = [
  { valor: 'abono', nome: 'Abono', classe: 't1' },
  { valor: 'tre', nome: 'TRE', classe: 't2' },
  { valor: 'atestado', nome: 'Atestado', classe: 't3' },
]

const br = iso => iso.split('-').reverse().join('/')
export const formatarPeriodo = (ini, fim) => (!fim || fim === ini ? br(ini) : `${br(ini)} a ${br(fim)}`)
