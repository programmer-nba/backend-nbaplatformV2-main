const router = require('express').Router()
const exchange = require('../../controllers/exchange.controller')
const auth = require('../../middleware/auth')

router.get('/exchange', auth, exchange.Exchange)

module.exports = router