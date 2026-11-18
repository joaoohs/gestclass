import {
  createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { auth, db } from './firebase'

// Nome digitado no cadastro, guardado até o perfil ser criado no banco.
const nomesDoCadastro = new Map()
// Evita criar o mesmo perfil duas vezes ao mesmo tempo (cadastro e App podem chamar juntos).
const criacoes = new Map()

export const entrar = (email, senha) => signInWithEmailAndPassword(auth, email.trim(), senha)
export const sair = () => signOut(auth)
export const recuperarSenha = email => sendPasswordResetEmail(auth, email.trim())

export async function criarConta(nome, email, senha) {
  const emailLimpo = email.trim().toLowerCase()
  nomesDoCadastro.set(emailLimpo, nome.trim())
  const { user } = await createUserWithEmailAndPassword(auth, emailLimpo, senha)
  await updateProfile(user, { displayName: nome.trim() })
  await garantirPerfil(user)
  return user
}

// Cria o perfil em usuarios/{uid} se ainda não existir.
// O primeiro cadastro do sistema vira administrador; os demais ficam pendentes de aprovação.
export function garantirPerfil(user) {
  if (!criacoes.has(user.uid)) {
    criacoes.set(user.uid, criarPerfil(user).finally(() => criacoes.delete(user.uid)))
  }
  return criacoes.get(user.uid)
}

async function criarPerfil(user) {
  const ref = doc(db, 'usuarios', user.uid)
  if ((await getDoc(ref)).exists()) return

  const email = user.email.toLowerCase()
  const nome = (nomesDoCadastro.get(email) || user.displayName || email.split('@')[0]).slice(0, 100)
  const base = { nome, email: user.email, criadoEm: serverTimestamp() }

  const adminRef = doc(db, 'config', 'admin')
  if (!(await getDoc(adminRef)).exists()) {
    try {
      const lote = writeBatch(db)
      lote.set(ref, { ...base, papel: 'admin', status: 'aprovado' })
      lote.set(adminRef, { uid: user.uid })
      await lote.commit()
      nomesDoCadastro.delete(email)
      return
    } catch {
      // Outra pessoa virou administradora no mesmo instante: segue como membro.
    }
  }
  await setDoc(ref, { ...base, papel: 'membro', status: 'pendente' })
  nomesDoCadastro.delete(email)
}

const MENSAGENS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos. Confira os dados e tente de novo.',
  'auth/invalid-login-credentials': 'E-mail ou senha incorretos. Confira os dados e tente de novo.',
  'auth/wrong-password': 'E-mail ou senha incorretos. Confira os dados e tente de novo.',
  'auth/user-not-found': 'E-mail ou senha incorretos. Confira os dados e tente de novo.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail. Use "Entrar" ou recupere a senha.',
  'auth/weak-password': 'Senha fraca: use pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-password': 'Digite a senha.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique a rede e tente de novo.',
  'auth/user-disabled': 'Esta conta foi desativada. Procure a direção da escola.',
  'auth/operation-not-allowed':
    'O login por e-mail e senha não está ativado no Firebase (Authentication > Sign-in method).',
  'auth/invalid-api-key': 'Configuração do Firebase inválida: confira as chaves no arquivo .env.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Configuração do Firebase inválida: confira as chaves no arquivo .env.',
  'permission-denied': 'O banco recusou a operação. As regras do Firestore podem estar desatualizadas.',
  unavailable: 'Não foi possível falar com o banco de dados. Verifique a conexão.',
}

export const mensagemDeErro = e =>
  MENSAGENS[e?.code] || 'Algo deu errado. Tente novamente.' + (e?.code ? ` (${e.code})` : '')
