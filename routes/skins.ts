import express, { Request, Response } from 'express'
import { getDefaultSkins } from '../utils'
const router = express.Router()

router.get('/default', async (_req: Request, res: Response) => {
  try {
    const skins = await getDefaultSkins()
    res.json(skins)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router