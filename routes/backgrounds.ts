import express, { Request, Response } from 'express'
import { getDefaultBackgrounds } from '../utils'
const router = express.Router()

router.get('/default', async (_req: Request, res: Response) => {
  try {
    const skins = await getDefaultBackgrounds()
    res.json(skins)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router