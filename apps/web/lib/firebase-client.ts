'use client'

import { getApps, initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'

const app =
  getApps()[0] ??
  initializeApp({
    apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    appId: required('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  })

export const firebaseAuth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required`)
  return value
}
