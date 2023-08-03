const router = require('express').Router();
const facebookservice = require('../../controllers/NBAservice/facebook.service.controller');
const websiteservice = require('../../controllers/NBAservice/website.service.controller');
const accountservice = require('../../controllers/NBAservice/account.service.controller');
const actservice = require('../../controllers/NBAservice/act.service.controller');

//facebookservice
router.use("/facebookservice/list", facebookservice.GetService)

//websiteservice
router.use("/websiteservice/list", websiteservice.GetService)

//accountservice
router.use("/accountservice/list", accountservice.GetService)
router.use("/accountservice/package/listbycate/:id", accountservice.GetServiceByCateId)

//actlegalservice
router.use("/actlegalservice/list", actservice.GetService)
router.use("/actlegalservice/package/listbycate/:id", actservice.GetServiceByCateId)


module.exports = router