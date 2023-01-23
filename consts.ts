import { User } from './types'

export const userKeys: (keyof User)[] = [
    'nickname',
    'description',
    'skin',
    'background'
]
//https://firebasestorage.googleapis.com/v0/b/{**BUCKET**}/o/{**PATH**}?alt=media
export const storageBucketPath = 'https://firebasestorage.googleapis.com/v0/b/minecodia.appspot.com'