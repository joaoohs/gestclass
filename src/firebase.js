import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
auth.languageCode = 'pt-BR' // e-mails do Firebase (ex.: redefinição de senha) em português
export const db = getFirestore(app)

// Opcional: VITE_FIREBASE_EMULADOR=true usa os emuladores locais (`npx firebase emulators:start`),
// para testar sem mexer nos dados reais.
if (import.meta.env.VITE_FIREBASE_EMULADOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8088)
}
