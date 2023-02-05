import { Request, Response } from 'express'
import { storageBucketPath } from './consts'
import { getToken, verifyToken, users, app, bucket, posts, likes } from './firebase-setup'
import { Post, User } from './types'
import { v4 } from 'uuid'

export async function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!await verifyToken(req)) res.status(403).send()
  else next()
}

export async function isOwner(req: Request, userId: string): Promise<boolean> {
  const token: string | undefined = getToken(req)
  if (!token) return false
  
  const payload = await app.auth().verifyIdToken(token)
  return payload.uid == userId
}

export async function getUserDocById(id: string): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined> {
  const doc = await users.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getUserById(id: string): Promise<User | undefined> {
  const doc = await getUserDocById(id)
  if (!doc) return undefined
  return doc.data() as User
}

export async function getPostDocById(id: string): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined> {
  const doc = await posts.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const doc = await getPostDocById(id)
  if (!doc) return undefined
  return doc.data() as Post
}

export async function getDefaultSkins() {
  return (await bucket.getFiles({prefix: 'default-skins/'}))
    .flat()
    // Remove the folder file
    .filter(e => e.name !== 'default-skins/')
    //                                             Replace all / with %2F 
    .map(e => `${storageBucketPath}/o/${e.metadata.name.replace(/\//g, '%2F')}?alt=media`)
}

export async function getDefaultBackgrounds() {
  return (await bucket.getFiles({prefix: 'default-backgrounds/'}))
  .flat()
  // Remove the folder file
  .filter(e => e.name !== 'default-backgrounds/')
  //                                             Replace all / with %2F 
  .map(e => `${storageBucketPath}/o/${e.metadata.name.replace(/\//g, '%2F')}?alt=media`)
}

export function generateUniqueId() {
  return v4()
}

export async function uploadFile(dataUrl: string): Promise<string> {
  const [, ext, data] = dataUrl.match(/^data:.+\/(.+);base64,(.*)$/) as string[]
  const buffer = Buffer.from(data, 'base64')
  const filename = `user-generated/${generateUniqueId()}.${ext}`
  await bucket.file(filename).save(buffer)
  return `${storageBucketPath}/o/${filename.replace(/\//g, '%2F')}?alt=media`
}

export async function getLikesDoc(id: string) {
  const doc = await likes.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getLikes(id: string): Promise<string[] | undefined> {
  const doc = await getLikesDoc(id)
  if (!doc) return undefined
  return (doc.data() as {likedByIds: string[]}).likedByIds
}

export async function getPosts(): Promise<(Post & {id: string})[]> {
  const res = await posts.get()
  return res.docs.map(doc => Object.assign({id: doc.id}, doc.data() as Post))
}
