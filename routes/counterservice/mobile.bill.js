const router = require('express').Router();
const MobileBill = require('../../controllers/counterservice/mobile.bill.controller');
const auth = require('../../middleware/auth');

router.post('/check',auth,MobileBill.Check);


module.exports = router;