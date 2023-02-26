import { Request } from 'express'
import admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore'
import { v4 } from 'uuid'
import { storageBucketPath } from './consts'

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.DB_URL,
  storageBucket: process.env.STORAGE_BUCKET
})

const db = app.firestore()
const users = db.collection('users')
// const posts = db.collection('posts')

const storage = getStorage()
const bucket = storage.bucket()

export function getTokenFromReq(req: Request): string | undefined {
  if (!req.headers.authorization) return undefined
  return req.headers.authorization.replace(/^Bearer\s/, '')
}

export async function getUserIdFromToken(token: string): Promise<string | undefined> {
  try {
    const payload = await admin.auth().verifyIdToken(token)
    return payload.uid
  }
  catch {
    return undefined
  }
}

export async function getProfileDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
  const doc = await users.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

// export async function getPostDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
//   const doc = await posts.doc(id).get()
//   if (!doc.exists) return undefined
//   return doc
// }

export function generateUniqueFileName(): string {
  return v4()
}

export async function uploadFile(buffer: Buffer, extension: string): Promise<string> {
  const filename = `user-generated/${generateUniqueFileName()}.${extension}`
  await bucket.file(filename).save(buffer)
  return `${storageBucketPath}/o/${filename.replace(/\//g, '%2F')}?alt=media`
}

// export async function getPostDocs(): Promise<QueryDocumentSnapshot<DocumentData>[]> {
//   const res = await posts.get()
//   return res.docs
// }

export async function updateProfile(userId: string, data: {[key: string]: any}): Promise<DocumentData> {
  return await users.doc(userId).set(data, { merge: true })
}

// export async function createPost(post: {[key: string]: any}): Promise<string> {
//   const postDoc: DocumentReference<DocumentData> = await posts.add(post)
//   return postDoc.id
// }