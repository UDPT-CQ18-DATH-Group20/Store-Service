var express = require("express");
var router = express.Router();
var Goods = require("../controllers/goodsController");

router.get("/type", Goods.allGoodsType);
router.get("/", Goods.searchGoods);
router.get("/:goods_id", Goods.getGoods);

module.exports = router;
