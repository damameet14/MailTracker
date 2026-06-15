import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getServerEnv } from './env'

function getAdminApp() {
  if (getApps()[0]) return getApps()[0]!
  const env = getServerEnv()
  const credential =
    env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replaceAll('\\n', '\n'),
        })
      : applicationDefault()
  return initializeApp({ projectId: env.FIREBASE_PROJECT_ID, credential })
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}
