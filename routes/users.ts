import express, { Request, Response } from 'express'
import { isOwner, getUserById } from '../utils'
import { userKeys } from '../consts'
import { getToken, users, app } from '../firebase-setup'
import { User } from '../types'
const router = express.Router()

router.get('/:userId', async (req: Request<{userId: string}>, res: Response) => {
  const { userId } = req.params
  try {
    const user: User | undefined = await getUserById(userId)
    if (!user) {
      res.status(404).send()
      return
    }
    else res.json(user)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.post('/:userId', async (req: Request<{userId: string}>, res: Response) => {
  const { userId } = req.params
  if (!await isOwner(req, userId)) res.status(403).send()

  const keys = Object.keys(req.body)

  if (!keys.every(key => (userKeys as string[]).includes(key))) {
    res.status(400).send()
    return
  }

  const token = getToken(req)

  if (!token) {
    res.status(400).send()
    return
  }

  const payload = await app.auth().verifyIdToken(token)
  await users.doc(payload.uid).set(req.body, { merge: true })

  res.status(200).send()
})

export default router