import express from 'express'
const router = express.Router()

router.get('/:userId', (req, res) => {
  const { userId } = req.params
  res.send(userId)
})

export default router