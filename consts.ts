import { Post, Profile, Message } from './types'

export const requiredProfileKeys: (keyof Profile)[] = [
  'username',
  'tag',
  'bio',
  'profilePicture'
]

export const requiredPostKeys: (keyof Post)[] = [
  'picture',
  'text'
]

export const requiredMessageKeys: (keyof Message)[] = [
  'image',
  'text',
]

//https://firebasestorage.googleapis.com/v0/b/{**BUCKET**}/o/{**PATH**}?alt=media
export const storageBucketPath = `https://firebasestorage.googleapis.com/v0/b/${process.env.STORAGE_BUCKET}`