import { verifyToken } from './firebase-functions'

export async function checkAccessToken(req, res) {
  if (!await verifyToken(req)) res.status(401).send()
}