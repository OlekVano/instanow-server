import express, { Request, Response } from 'express'
import { FieldValue } from 'firebase-admin/firestore'
import { app, getToken, likes } from '../firebase-setup'
import { getLikes } from '../utils'

const router = express.Router()

router.post('/:id', async (req: Request<{id: string}>, res: Response) => {
  const { id } = req.params

  try {
    const likedByIds = await getLikes(id)
    if (!likedByIds) {
      res.status(404).send()
      return
    }

    const userId = (await app.auth().verifyIdToken(getToken(req) as string)).uid

    if (likedByIds.includes(userId)) {
      await likes.doc(id).update({
        likedByIds: FieldValue.arrayRemove(userId)
      })
    }
    else {
      await likes.doc(id).update({
        likedByIds: FieldValue.arrayUnion(userId)
      })
    }

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router