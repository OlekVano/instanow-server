import { Request } from 'express'
import admin, { ServiceAccount } from 'firebase-admin'
import serviceAccount from './minecodia-firebase-adminsdk.json'

export const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: 'https://minecodia.firebaseio.com'
})

const db = app.firestore()
export const users = db.collection('users')

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