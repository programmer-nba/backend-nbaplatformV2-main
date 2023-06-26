const router = require('express').Router();
const member = require('../../controllers/public/member.controller')
const auth = require('../../middleware/auth.public');

router.get('/tel/:tel', auth, member.getByTel);
router.post('/givecommission', auth, member.giveCommission);
router.post('/givehappypoint', auth, member.giveHappyPoint);

router.post('/transfer_member', member.transferMember);
module.exports = router;