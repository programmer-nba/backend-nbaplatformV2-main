const router = require('express').Router();
const Member = require('../../controllers/public/member.controller')
const MemberTeam = require('../../controllers/public/memberteam.controller')
const auth = require('../../middleware/auth.public');


router.get('/tel/:tel', auth, Member.getByTel);

// router.post('/givecommission', auth, Member.giveCommission);
// router.post('/givehappypoint', auth, Member.giveHappyPoint);
// router.post('/transfer_member', Member.transferMember);
router.get('/memberteam/:tel', auth, MemberTeam.getMemberTeam)

module.exports = router;