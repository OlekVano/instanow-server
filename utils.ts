import { Request, Response } from 'express'
import { getToken, verifyToken, users, app } from './firebase-setup'
import { User } from './types'

export async function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!await verifyToken(req)) res.status(403).send()
  else next()
}

export async function isOwner(req: Request, userId: string): Promise<boolean> {
  const token: string | undefined = getToken(req)
  if (!token) return false
  const payload = await app.auth().verifyIdToken(token as string)
  return payload.uid == userId
}

export async function getUserById(id: string): Promise<User | undefined> {
  const snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await users.where('id', '==', id).get();
  if (snapshot.empty) return undefined

  const result: User[] = []
  snapshot.forEach(doc => result.push(doc.data() as User));
  return result[0]
}