var express = require("express");
var router = express.Router();
var Goods = require("../controllers/goodsController");
var auth = require("../services/authenticate");

router.get("/type", Goods.allGoodsType);
router.get("/", Goods.searchGoods);
router.get("/:goods_id", Goods.getGoods);
router.get("/:goods_id/cart", auth, Goods.addGoodsToCart);

module.exports = router;
