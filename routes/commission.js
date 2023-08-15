const router = require('express').Router()
const commission = require('../controllers/commission.controller')
const auth  = require('../middleware/auth')

router.get("/totalcommission/:tel", auth, commission.GetCommissionByTel)
router.get("/list/:tel", auth, commission.GetUnsummedCommissionsByTel)
router.get("/userallsale/:tel", auth, commission.GetUserAllSale)

module.exports = router