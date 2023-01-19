import admin from 'firebase-admin'
import serviceAccount from './minecodia-firebase-adminsdk.json' assert {type: 'json'}

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://minecodia.firebaseio.com'
})

const db = admin.firestore()
export const users = db.collection('users')

function getToken(req) {
  if (!req.headers.authorization) return undefined
  return req.headers.authorization.replace(/^Bearer\s/, '')
}

export async function verifyToken(req) {
  try {
    const token = getToken(req)
    if (!token) return false

    const payload = await admin.auth().verifyIdToken(token)
    return payload !== null
    
  } catch (err) {
    return false
  }
}