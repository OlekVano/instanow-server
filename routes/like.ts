import express, { Request, Response } from 'express'
import { changeLike } from '../firebase-access'
import { requireAuthorization } from '../utils'

const router = express.Router()

router.post('/:id', async (req: Request<{id: string}>, res: Response) => {
  const { id } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    if (!await changeLike(id, userId)) res.status(404).send()
    else res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router