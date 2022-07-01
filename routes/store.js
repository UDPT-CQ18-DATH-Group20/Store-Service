var express = require("express");
var router = express.Router();
const multer = require("multer");
var auth = require("../services/authenticate");
var storeController = require("../controllers/storeController");

const upload = multer();

router.use(auth);
router.use(storeController.validateAccountId);
router.post(
  "/create",
  storeController.validateAndSanitizeStore,
  storeController.createStore
);
router.post(
  "/create/item",
  upload.single("picture"),
  storeController.validateAndSanitizeGoods,
  storeController.createGoods
);

module.exports = router;
