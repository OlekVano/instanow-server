import { getToken, verifyToken, users, app } from './firebase-setup.js'

export async function isAuthenticated(req, res, next) {
  if (!await verifyToken(req)) res.status(403).send()
  else next()
}

export async function isOwner(req, userId) {
  const token = getToken(req)
  if (!token) return false
  const payload = await app.auth().verifyIdToken(token)
  return payload.uid == userId
}

export async function getUserById(id) {
  const snapshot = await users.where('id', '==', id).get();
  if (snapshot.empty) return undefined

  const result = []
  snapshot.forEach(doc => {
    result.push(doc.data())
  });
    
  return result[0]
}