import { Request, Response } from 'express'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { getUserIdFromToken, getProfileDocById, getTokenFromReq, uploadFile, getPostDocById, getPostsOfUser, getPostDocs } from './firebase-access'
import { Comment, CommentWithAuthor, Post, Profile } from './types'

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

export async function getPostById(id: string): Promise<Post | undefined> {
  const doc = await getPostDocById(id)
  if (!doc) return undefined
  return addIdToDict(doc.data() as Exclude<Post, {id: string}>, id) as Post
}

export async function uploadDataURL(dataUrl: string): Promise<string> {
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

export async function getPosts(): Promise<Post[]> {
  const postDocs = await getPostDocs()
  const posts = postDocs.map(getPostFromDoc)
  let postsWithAuthors = await Promise.all(posts.map(addAuthorToPost))
  postsWithAuthors = await Promise.all(postsWithAuthors.map(async function addAuthorsToPostComments(post) {
    const commentsWithAuthors = await addAuthorsToComments(post.comments)
    return Object.assign(
      {},
      post,
      {
        comments: commentsWithAuthors
      }
    )
  }))

  return postsWithAuthors

  // ***************************

  function getPostFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Post {
    return addIdToDict(doc.data() as Exclude<Post, {id: string}>, doc.id) as Post
  }
}

export async function addAuthorToPost(post: Post & {[key: string]: any}): Promise<Post & {author: Profile}> {
  return Object.assign({
    author: await getProfileById(post.authorId) as Profile
  }, post)
}

export async function addPostsToProfile(profile: Profile) {
  return Object.assign({
    posts: await getPostsOfUser(profile.id)
  }, profile)
}

export async function addAuthorsToComments(comments: Comment[]): Promise<CommentWithAuthor[]> {
  let commentsWithAuthors: CommentWithAuthor[] = []
  for (let comment of comments) {
    const commentWithAuthor = await addAuthorToComment(comment)
    commentsWithAuthors.push(commentWithAuthor)
  }
  return commentsWithAuthors
}

export async function addAuthorToComment(comment: Comment): Promise<CommentWithAuthor> {
  const author = await getProfileById(comment.authorId)
  let commentWithAuthor = Object.assign({
    author: author,
  }, comment)
  const commentsWithAuthors = await addAuthorsToComments(commentWithAuthor.comments)
  commentWithAuthor.comments = commentsWithAuthors
  return commentWithAuthor as CommentWithAuthor
}

export function removeIdFromDict<T extends {id: any}>(dict: T): Omit<T, 'id'> {
  const entries: [string, any][] = Object.entries(dict)
  const entriesWithoutId = entries.filter((entry) => entry[0] !== 'id')
  const dictWithoutId = Object.fromEntries(entriesWithoutId) as Omit<T, 'id'>
  return dictWithoutId
}