import express, { Request, Response } from 'express'
import { requiredProfileKeys } from '../consts'
import { createLikes, getProfileDocById, updateProfile } from '../firebase-access'
import { Profile } from '../types'
import { addLikesToDict, getProfileById, requireAuthorization, uploadDataURL } from '../utils'

const router = express.Router()

router.get('/:profileId', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const user: Profile | undefined = await getProfileById(profileId)
    if (!user) res.status(404).send()
    else {
      await addLikesToDict(user, userId)
      res.json(user)
    }
    
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

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

    // If custom uploaded background or skin
    if (req.body.skin.startsWith('data')) req.body.skin = await uploadDataURL(req.body.skin)
    if (req.body.background.startsWith('data')) req.body.background = await uploadDataURL(req.body.background)
  
    if (!await getProfileDocById(userId)) {
      await createLikes(userId)
    }

    await updateProfile(userId, req.body)

    if (!await getProfileDocById(userId)) {
      await createLikes(userId)
    }

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

export default router