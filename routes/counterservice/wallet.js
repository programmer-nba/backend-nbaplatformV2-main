const router = require('express').Router();
const Wallet = require('../../controllers/counterservice/wallet.controller');
const auth = require('../../middleware/auth');

router.post('/check',auth,Wallet.Check);
router.post('/confirm',auth,Wallet.Confirm);


module.exports = router;