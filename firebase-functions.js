import * as admin from 'firebase-admin'
const serviceAccount = require('./minecodia-firebase-adminsdk.json')

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

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