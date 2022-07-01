var express = require("express");
var router = express.Router();

var storeRouter = require("./store");
var goodsRouter = require("./goods");

router.use("/store", storeRouter);
router.use("/goods", goodsRouter);

module.exports = router;
