import { Request } from 'express'
import admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'
import { storageBucketPath } from './consts'
import { v4 } from 'uuid'
import { config } from 'dotenv'
import { DocumentSnapshot, DocumentData, DocumentReference, QueryDocumentSnapshot, FieldValue } from 'firebase-admin/firestore'
import { getLikesById } from './utils'
config()

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: 'https://minecodia.firebaseio.com',
  storageBucket: 'minecodia.appspot.com'
})

const db = app.firestore()
const users = db.collection('users')
const posts = db.collection('posts')
const likes = db.collection('likes')

const storage = getStorage()
const bucket = storage.bucket();

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

export async function getPostDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
  const doc = await posts.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getDefaultSkins(): Promise<string[]> {
  return (await bucket.getFiles({prefix: 'default-skins/'}))
    .flat()
    // Remove the folder file
    .filter(e => e.name !== 'default-skins/')
    //                                             Replace all / with %2F 
    .map(e => `${storageBucketPath}/o/${e.metadata.name.replace(/\//g, '%2F')}?alt=media`)
}

export async function getDefaultBackgrounds(): Promise<string[]> {
  return (await bucket.getFiles({prefix: 'default-backgrounds/'}))
  .flat()
  // Remove the folder file
  .filter(e => e.name !== 'default-backgrounds/')
  //                                             Replace all / with %2F 
  .map(e => `${storageBucketPath}/o/${e.metadata.name.replace(/\//g, '%2F')}?alt=media`)
}

export function generateUniqueFileName(): string {
  return v4()
}

export async function uploadFile(buffer: Buffer, extension: string): Promise<string> {
  const filename = `user-generated/${generateUniqueFileName()}.${extension}`
  await bucket.file(filename).save(buffer)
  return `${storageBucketPath}/o/${filename.replace(/\//g, '%2F')}?alt=media`
}

export async function getLikesDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
  const doc = await likes.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getPostDocs(): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const res = await posts.get()
  return res.docs
}

export async function updateProfile(userId: string, data: {[key: string]: any}): Promise<DocumentData> {
  return await users.doc(userId).set(data, { merge: true })
}

export async function createPost(post: {[key: string]: any}): Promise<string> {
  const postDoc: DocumentReference<DocumentData> = await posts.add(post)
  return postDoc.id
}

export async function createLikes(id: string) {
  await likes.doc(id).set({likedByIds: []})
}

export async function changeLike(likesId: string, userId: string): Promise<boolean> {
  const likedByIds = await getLikesById(likesId)
  if (!likedByIds) return false

  if (likedByIds.includes(userId)) {
    await likes.doc(likesId).update({
      likedByIds: FieldValue.arrayRemove(userId)
    })
  }
  else {
    await likes.doc(likesId).update({
      likedByIds: FieldValue.arrayUnion(userId)
    })
  }

  return true
}