const router = require('express').Router();
const member = require('../controllers/member.controller');
const auth = require('../middleware/auth');

router.post('/change_password',auth, member.change_password);
router.post('/verify_iden',auth, member.verify_iden);
router.post('/verify_bank',auth, member.verify_bank);
router.get('/login_history', auth, member.login_history);
router.get('/online_device', auth,member.online_device);
router.delete('/online_device/:id', auth, member.delete_device);
module.exports = router;