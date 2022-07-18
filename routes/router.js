var express = require("express");
var router = express.Router();

var storeRouter = require("./store.js");
var goodsRouter = require("./goods.js");

router.use("/store", storeRouter);
router.use("/goods", goodsRouter);

module.exports = router;
