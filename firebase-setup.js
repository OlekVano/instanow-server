import admin from 'firebase-admin'
import serviceAccount from './minecodia-firebase-adminsdk.json' assert {type: 'json'}

export const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://minecodia.firebaseio.com'
})

const db = app.firestore()
export const users = db.collection('users')

export function getToken(req) {
  if (!req.headers.authorization) return undefined
  return req.headers.authorization.replace(/^Bearer\s/, '')
}

export async function verifyAccessToken(token) {
  try {
    const payload = await admin.auth().verifyIdToken(token)
    return payload !== null
  } catch {
    return false
  }
}

export async function verifyToken(req) {
  try {
    const token = getToken(req)
    if (!token) return false

    return verifyAccessToken(token)
    
  } catch (err) {
    return false
  }
}