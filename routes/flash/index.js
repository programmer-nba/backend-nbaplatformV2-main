const router = require("express").Router();
const flash = require("../../controllers/flash/flash.controller");

router.post("/ping", flash.ping);
router.post("/check", flash.check);
router.post("/address_core", flash.address_core);

module.exports = router;
