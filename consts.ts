import { Post, User } from './types'

export const userKeys: (keyof User)[] = [
  'nickname',
  'description',
  'skin',
  'background'
]

export const postKeys: (keyof Post)[] = [
  'title',
  'image',
  'content',
]

//https://firebasestorage.googleapis.com/v0/b/{**BUCKET**}/o/{**PATH**}?alt=media
export const storageBucketPath = 'https://firebasestorage.googleapis.com/v0/b/minecodia.appspot.com'