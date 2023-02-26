import { Request, Response } from 'express'
import { getUserIdFromToken, getProfileDocById, getTokenFromReq, uploadFile } from './firebase-access'
import { Profile } from './types'

export async function validateToken(token: string): Promise<boolean> {
  return Boolean(await getUserIdFromToken(token))
}

export function addIdToDict(dict: {[key: string]: any}, id: string) {
  dict.id = id
  return dict
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const doc = await getProfileDocById(id)
  if (!doc) return undefined
  return addIdToDict(doc.data() as Exclude<Profile, {id: string}>, id) as Profile
}

// export async function getPostById(id: string): Promise<Post | undefined> {
//   const doc = await getPostDocById(id)
//   if (!doc) return undefined
//   return addIdToDict(doc.data() as Exclude<Post, {id: string}>, id) as Post
// }

export async function uploadDataURL(dataUrl: string): Promise<string> {
  console.log('dataurl', dataUrl)
  const [, extension, data] = dataUrl.match(/^data:.+\/(.+);base64,(.*)$/) as string[]
  const buffer = Buffer.from(data, 'base64')
  return await uploadFile(buffer, extension)
}

export async function requireAuthorization(req: Request, res: Response): Promise<string | undefined> {
  const token = getTokenFromReq(req)
  if (!token) {
    res.status(401).send()
    return undefined
  }

  const userId = await getUserIdFromToken(token)
  if (!userId) {
    res.status(401).send()
    return undefined
  }
  
  return userId
}

// export async function getPosts(): Promise<Post[]> {
//   const postDocs = await getPostDocs()
//   return postDocs.map(getPostFromDoc)

//   // ***************************

//   function getPostFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Post {
//     return addIdToDict(doc.data() as Exclude<Post, {id: string}>, doc.id) as Post
//   }
// }

// export async function addAuthorToPost(post: Post & {[key: string]: any}): Promise<Post & {author: Profile}> {
//   post.author = await getProfileById(post.authorId)
//   return post as Post & {author: Profile}
// }