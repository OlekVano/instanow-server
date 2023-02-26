import express, { Request, Response } from 'express'
import { requiredProfileKeys } from '../consts'
import { updateProfile } from '../firebase-access'
import { Profile } from '../types'
import { getProfileById, requireAuthorization, uploadDataURL } from '../utils'

const router = express.Router()

router.post('/:profileId', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId: string | undefined = await requireAuthorization(req, res)
    if (userId !== profileId) {
      res.status(403).send()
      return
    }

    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (requiredProfileKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }

    // If new profile picture
    if (req.body.profilePicture.startsWith('data')) req.body.profilePicture = await uploadDataURL(req.body.profilePicture)
    
    // If new profile
    if (!await getProfileById(profileId)) {
      req.body.followers = []
      req.body.following = []
      req.body.posts = []
    }

    await updateProfile(userId, req.body)

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.get('/:profileId', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const profile: Profile | undefined = await getProfileById(profileId)
    if (!profile) res.status(404).send()
    else {
      console.log(profile)
      res.json(profile)
    } 

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

export default router