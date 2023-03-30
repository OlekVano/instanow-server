import { Request } from 'express'
import admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'
import { DocumentSnapshot, DocumentData, DocumentReference, QueryDocumentSnapshot, FieldValue } from 'firebase-admin/firestore'
import { v4 } from 'uuid'
import { storageBucketPath } from './consts'
import { ChatWithoutId, Post, PostWithoutId, Profile } from './types'

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
const posts = db.collection('posts')
const chats = db.collection('chats')

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

export async function getPostDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
  const doc = await posts.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export async function getChatDocById(id: string): Promise<DocumentSnapshot<DocumentData> | undefined> {
  const doc = await chats.doc(id).get()
  if (!doc.exists) return undefined
  return doc
}

export function generateUniqueFileName(): string {
  return v4()
}

export async function uploadFile(buffer: Buffer, extension: string): Promise<string> {
  const filename = `user-generated/${generateUniqueFileName()}.${extension}`
  await bucket.file(filename).save(buffer)
  return `${storageBucketPath}/o/${filename.replace(/\//g, '%2F')}?alt=media`
}

export async function getPostDocs(): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const res = await posts.get()
  return res.docs
}

export async function getProfileDocs(): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const res = await users.get()
  return res.docs
}

export async function updateProfile(userId: string, profile: Omit<Profile, 'id'>): Promise<DocumentData> {
  return await users.doc(userId).set(profile, { merge: true })
}

export async function updatePost(postId: string, post: PostWithoutId) {
  return await posts.doc(postId).set(post, { merge: true })
}

export async function createPost(post: {[key: string]: any}): Promise<string> {
  const postWithTimestamp = Object.assign({
    createdAt: Date.now()
  }, post)
  const postDoc: DocumentReference<DocumentData> = await posts.add(postWithTimestamp)
  return postDoc.id
}

export async function addMessage(message: {[key: string]: any}, chatId: string) {
  const messageWithTimestamp = Object.assign({
    sentAt: Date.now()
  }, message)
  chats.doc(chatId).update({
    messages: FieldValue.arrayUnion(messageWithTimestamp)
  })
}

export async function getPostsOfUser(userId: string): Promise<Post[]> {
  const querySnapshot = await posts.where('authorId', '==', userId).get()
  let userPosts: any[] = []
  querySnapshot.forEach(doc => userPosts.push(Object.assign({
    id: doc.id
  }, doc.data())))
  return userPosts
}

export async function getFollowedProfiles(userId: string): Promise<Profile[]> {
  const querySnapshot = await users.where('followersIds', 'array-contains', userId).get()
  let followedProfiles: Profile[] = []
  querySnapshot.forEach(doc => followedProfiles.push(Object.assign({
    id: doc.id
  }, doc.data()) as Exclude<Profile, {id: string}>))
  return followedProfiles
}

export async function addFollowing(userId: string, userIdToFollow: string) {
  await users.doc(userId).update({
    followingIds: FieldValue.arrayUnion(userIdToFollow)
  })
}

export async function addFollower(userId: string, followerId: string) {
  await users.doc(userId).update({
    followersIds: FieldValue.arrayUnion(followerId)
  })
}

export async function removeFollowing(userId: string, userIdToUnfollow: string) {
  await users.doc(userId).update({
    followingIds: FieldValue.arrayRemove(userIdToUnfollow)
  })
}

export async function removeFollower(userId: string, followerId: string) {
  await users.doc(userId).update({
    followersIds: FieldValue.arrayRemove(followerId)
  })
}

export async function addChat(chat: ChatWithoutId): Promise<string> {
  const addedChat = await chats.add(chat)
  return addedChat.id
}

export async function getChatDocsById(id: string): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const res = await chats.where('userIds', 'array-contains', id).get()
  return res.docs
}