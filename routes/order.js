const router = require('express').Router()
const order = require('../controllers/NBAservice/order.controller')
const auth  = require('../middleware/auth')

router.get("/list/:id", auth, order.GetAll)

module.exports = router