const router = require('express').Router()
const commission = require('../controllers/commission.controller')
const auth  = require('../middleware/auth')

router.get("/totalcommission/:tel", auth, commission.GetCommissionByTel)
router.get("/list/:tel", auth, commission.GetUnsummedCommissionsByTel)

module.exports = router