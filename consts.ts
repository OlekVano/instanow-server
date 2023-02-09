import { Post, Profile } from './types'

export const requiredProfileKeys: (keyof Profile)[] = [
  'nickname',
  'description',
  'skin',
  'background'
]

export const requiredPostKeys: (keyof Post)[] = [
  'title',
  'image',
  'content',
]

//https://firebasestorage.googleapis.com/v0/b/{**BUCKET**}/o/{**PATH**}?alt=media
export const storageBucketPath = 'https://firebasestorage.googleapis.com/v0/b/minecodia.appspot.com'