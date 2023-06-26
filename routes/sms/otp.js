const router = require('express').Router();
const sms = require('../../controllers/sms/sms.controller.js')
const auth = require('../../middleware/auth.public.js')
router.post('/verify',auth, sms.verify);
router.post('/check',auth, sms.check);
router.post('/check_new_password',auth, sms.checkForgotPassword);
module.exports = router;