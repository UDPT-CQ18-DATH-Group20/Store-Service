var express = require("express");
var router = express.Router();
const multer = require("multer");
var auth = require("../services/authenticate");

var storeController = require("../controllers/storeController");

const upload = multer();

router.use(auth);
router.use(storeController.validateAccountId);
router.post(
  "/",
  storeController.validateAndSanitizeStore,
  storeController.createStore
);
router.post(
  "/create/goods",
  upload.single("picture"),
  storeController.validateAndSanitizeGoods,
  storeController.createGoods
);

router.get("/", storeController.getStoreInfo);
router.get("/goods", storeController.getAllGoodsOfStore);
router.patch(
  "/goods/:goods_id/update-quantity",
  storeController.updateGoodsQuantity
);

router.patch(
  "/goods/:goods_id/update-quantity",
  storeController.updateGoodsQuantity
);

router.delete("/goods/:goods_id", storeController.deleteGoods);

module.exports = router;
