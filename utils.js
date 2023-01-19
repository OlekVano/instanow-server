import { verifyToken } from './firebase-setup.js'


export async function checkAccessToken(req, res, next) {
  if (!await verifyToken(req)) res.status(401).send()
  else next()
}