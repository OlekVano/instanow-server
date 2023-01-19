import express from 'express'
import { isOwner, getUserById } from '../utils.js'
import { userKeys } from '../consts.js'
import { getToken, users, app } from '../firebase-setup.js'
const router = express.Router()

router.get('/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const user = await getUserById(userId)
    console.log(user)
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

router.post('/:userId', async (req, res) => {
  console.log('POST')
  const { userId } = req.params
  if (!isOwner(req, userId)) res.status(403).send()

  const keys = Object.keys(req.body)

  if (!keys.every(key => userKeys.includes(key))) {
    res.status(400).send()
    return
  }

  const payload = await app.auth().verifyIdToken(getToken(req))
  await users.doc(payload.uid).set(req.body, { merge: true })

  res.status(200).send()
})

export default router