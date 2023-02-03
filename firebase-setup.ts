import { Request } from 'express'
import admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'
import { config } from 'dotenv'
config()

export const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: 'https://minecodia.firebaseio.com',
  storageBucket: 'minecodia.appspot.com'
})

const db = app.firestore()
export const users = db.collection('users')
export const posts = db.collection('posts')
export const likes = db.collection('likes')

const storage = getStorage()
export const bucket = storage.bucket();

export function getToken(req: Request): string | undefined {
  if (!req.headers.authorization) return undefined
  return req.headers.authorization.replace(/^Bearer\s/, '')
}

export async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    const payload = await admin.auth().verifyIdToken(token)
    return payload !== null
  } catch {
    return false
  }
}

export async function verifyToken(req: Request): Promise<boolean> {
  try {
    const token: string | undefined = getToken(req)
    if (!token) return false

    return verifyAccessToken(token)
    
  } catch (err) {
    return false
  }
}