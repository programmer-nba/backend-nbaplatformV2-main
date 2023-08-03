const router = require('express').Router()
const facebookservice = require('../../controllers/NBAservice/facebook.service.controller')
const websiteservice = require('../../controllers/NBAservice/website.service.controller')
const accountservice = require('../../controllers/NBAservice/account.service.controller')
const actservice = require('../../controllers/NBAservice/act.service.controller')
const auth  = require('../../middleware/auth')

//facebookservice
router.use("/facebookservice/list", auth, facebookservice.GetService)
router.use("/facebookservice/order", auth, facebookservice.order)

//websiteservice
router.use("/websiteservice/list", auth, websiteservice.GetService)

//accountservice
router.use("/accountservice/list", auth, accountservice.GetService)
router.use("/accountservice/package/listbycate/:id", auth, accountservice.GetServiceByCateId)

//actlegalservice
router.use("/actlegalservice/list", auth, actservice.GetService)
router.use("/actlegalservice/package/listbycate/:id", auth, actservice.GetServiceByCateId)


module.exports = router