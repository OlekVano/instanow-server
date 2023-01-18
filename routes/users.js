const express = require('express')
const router = express.Router()

router.get('/:userId', (req, res) => {
  const { userId } = req.params
  res.send(userId)
})

module.exports = router