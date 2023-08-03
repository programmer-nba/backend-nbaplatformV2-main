const router = require('express').Router()
const facebookservice = require('../../controllers/NBAservice/facebook.service.controller')
const websiteservice = require('../../controllers/NBAservice/website.service.controller')
const accountservice = require('../../controllers/NBAservice/account.service.controller')
const actservice = require('../../controllers/NBAservice/act.service.controller')
const auth  = require('../../middleware/auth')

//facebookservice
router.get("/facebookservice/list", auth, facebookservice.GetService)
router.post("/facebookservice/order", auth, facebookservice.order)

//websiteservice
router.get("/websiteservice/list", auth, websiteservice.GetService)

//accountservice
router.get("/accountservice/list", auth, accountservice.GetService)
router.get("/accountservice/package/listbycate/:id", auth, accountservice.GetServiceByCateId)

//actlegalservice
router.get("/actlegalservice/list", auth, actservice.GetService)
router.get("/actlegalservice/package/listbycate/:id", auth, actservice.GetServiceByCateId)


module.exports = router