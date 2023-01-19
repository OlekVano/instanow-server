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

export default router