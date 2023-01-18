import { verifyToken } from './firebase-functions.js'

export async function checkAccessToken(req, res, next) {
  if (!await verifyToken(req)) res.status(401).send()
  next()
}