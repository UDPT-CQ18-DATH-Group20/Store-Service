var express = require("express");
var router = express.Router();
var Goods = require("../controllers/goodsController");
var auth = require("../services/authenticate");

router.get("/type", Goods.allGoodsType);
router.get("/", Goods.searchGoods);
router.get("/count", Goods.countSearchDoc);
router.get("/:goods_id", Goods.getGoods);
router.post("/cart/:goods_id", auth, Goods.addGoodsToCart);
router.patch("/order-transaction", auth, Goods.orderTransaction);

module.exports = router;
