import { Request, Response } from 'express'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { getUserIdFromToken, getProfileDocById, getTokenFromReq, uploadFile, getPostDocById, getPostsOfUser, getPostDocs, addFollower, addFollowing, removeFollower, removeFollowing, getChatDocsById, addChat } from './firebase-access'
import { Chat, ChatWithoutId, ChatWithUser, Comment, CommentWithAuthor, Post, Profile, WithComments, WithLikes } from './types'

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

export async function getChatByIds(id1: string, id2: string): Promise<Chat> {
  const chats = await getChats(id1)
  const mutualChats = chats.filter(filterChat)

  if (mutualChats.length !== 0) return mutualChats[0]

  const emptyChat: ChatWithoutId = {
    userIds: [id1, id2],
    messages: []
  }

  const chatId = await addChat(emptyChat)

  return addIdToDict(emptyChat, chatId) as Chat
  
  // *********************************

  function filterChat(chat: Chat) {
    return chat.userIds.includes(id2)
  }
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

export async function getChats(userId: string): Promise<ChatWithUser[]> {
  const chatDocs = await getChatDocsById(userId)
  const chats = await Promise.all(chatDocs.map(getChatFromDoc))
  return chats

  // ***************************

  async function getChatFromDoc(doc: QueryDocumentSnapshot<DocumentData>): Promise<ChatWithUser> {
    return await addUserToChat(addIdToDict(doc.data() as Exclude<Post, {id: string}>, doc.id) as Chat, userId) 
  }
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

export async function addUserToChat(chat: Chat, currUserId: string): Promise<ChatWithUser> {
  const user = await getProfileById(chat.userIds.filter(filterUserId)[0]) as Profile
  const chatWithUser: ChatWithUser = Object.assign({
    user: user,
  }, chat)
  return chatWithUser

  // ***************************

  function filterUserId(userId: string) {
    return userId !== currUserId
  }
}

export function removeIdFromDict<T extends {id: any}>(dict: T): Exclude<T, {id: any}> {
  const entries: [string, any][] = Object.entries(dict)
  const entriesWithoutId = entries.filter((entry) => entry[0] !== 'id')
  const dictWithoutId = Object.fromEntries(entriesWithoutId) as Exclude<T, {id: any}>
  return dictWithoutId
}

export async function addComment(obj: WithComments, authorId: string, text: string, query: number[]) {
  if (query.length === 0) {
    obj.comments.push({
      authorId: authorId,
      text: text,
      comments: [],
      likes: [],
      createdAt: Date.now()
    })
  }
  else {
    await addComment(obj.comments[query[0]], authorId, text, query.slice(1))
  }
  return obj
}

export async function addLike(obj: WithLikes, authorId: string, query: number[]) {
  if (query.length === 0) {
    if (obj.likes.includes(authorId)) return obj
    obj.likes.push(authorId)
  }
  else {
    await addLike(obj.comments[query[0]], authorId, query.slice(1))
  }
  return obj
}

export async function removeLike(obj: WithLikes, authorId: string, query: number[]) {
  if (query.length === 0) {
    if (!obj.likes.includes(authorId)) return obj
    obj.likes.push(authorId)
  }
  else {
    await addLike(obj.comments[query[0]], authorId, query.slice(1))
  }
  return obj
}

export async function follow(userId: string, userIdToFollow: string) {
  let user = await getProfileById(userId)
  if (user?.followingIds.includes(userIdToFollow)) return false

  await addFollowing(userId, userIdToFollow)
  await addFollower(userIdToFollow, userId)

  return true
}

export async function unfollow(userId: string, userIdToUnfollow: string) {
  let user = await getProfileById(userId)
  if (!user?.followingIds.includes(userIdToUnfollow)) return false

  await removeFollowing(userId, userIdToUnfollow)
  await removeFollower(userIdToUnfollow, userId)

  return true
}