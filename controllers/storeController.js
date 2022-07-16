var mongoose = require("mongoose");
const { query, body, validationResult } = require("express-validator");
const stream = require("stream");
const drive = require("../services/google_drive");
const Store = require("../models/store");
const StoreInfo = require("../models/store_info");
const Goods = require("../models/goods");

const EMPLOYEE_TYPE = 4;
const STORE_TYPE = 2;

const GOODS_FOLDER = "GOODS";

const GOODS_TYPE = [
  "Tươi sống",
  "Rau củ",
  "Trái cây",
  "Phụ gia",
  "Đã qua chế biến",
  "Khác",
];

const myValidationResult = validationResult.withDefaults({
  formatter: (error) => {
    return error.msg;
  },
});

exports.GOODS_TYPE = GOODS_TYPE;

exports.validateAccountId = [
  query("account_id").isMongoId(),
  function (req, res, next) {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send("Account id isn't valid!");
    }
    next();
  },
];

exports.createStore = async function (req, res, next) {
  let accountId = req.query.account_id;
  let userType = req.query.user_type;
  if (userType != EMPLOYEE_TYPE) {
    return res.status(401).send("User don't have the authorization!");
  }

  Store.countDocuments({ account_id: accountId }, async function (err, count) {
    if (err) return next(err);

    if (count > 0) {
      return res.status(400).send("Account already have a store!");
    }
    console.log(count);

    var store = new Store();
    var store_info = new StoreInfo();

    store_info.established_date = new Date(req.body.established_date);
    store_info.opening_time = req.body.opening_time;
    store_info.closing_time = req.body.closing_time;
    store_info.goods_type = req.body.goods_type;
    store_info.receptionist_name = req.body.receptionist_name;

    try {
      await store_info.save();
    } catch (e) {
      return next(e);
    }

    store.storeinfo_id = store_info;
    store.profile_id = req.body.profile_id;
    store.account_id = req.body.account_id;
    store.name = req.body.name;
    store.email = req.body.email;
    store.logo = req.body.logo;
    store.phone = req.body.phone;
    store.address = req.body.address;
    store
      .save()
      .then(() => res.status(201).send("Store has been created for user"))
      .catch(next);
  });
};

exports.validateAndSanitizeStore = [
  body("name", "Store name is required!").trim().not().isEmpty(),
  body("email", "Email is not valid!").trim().isEmail(),
  body("logo", "Logo url is not valid!").trim().isURL(),
  body("phone", "Phone is not valid!").trim().isMobilePhone(),
  body("address", "Address is not valid!").trim(),
  body("established_date", "Established date is not valid!").trim().isDate(),
  body("opening_time", "Opening time is required!").trim().not().isEmpty(),
  body("closing_time", "Closing time is required!").trim().not().isEmpty(),
  body("goods_type", "Goods must be an array!").isArray(),
  body("receptionist_name", "Receptionist is required!").trim().not().isEmpty(),
  function (req, res, next) {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }
    next();
  },
];

exports.createGoods = function (req, res, next) {
  let accountId = req.query.account_id;
  let userType = req.query.user_type;
  if (userType != STORE_TYPE) {
    return res.status(401).send("User don't have the authorization!");
  }

  Store.findOne({ account_id: accountId })
    .select("_id")
    .exec(async function (err, store) {
      if (err) return next(err);

      if (!store) {
        return res.status(400).send("User don't have the authorization!");
      }

      var goods = new Goods();
      goods.store_id = store._id;
      goods.name = req.body.name;
      goods.type = req.body.type;
      goods.picture = req.body.picture;
      goods.price = req.body.price;
      goods.remains = req.body.remains;
      goods.available = req.body.remains > 0 ? true : false;

      const fileObj = req.file;
      if (!fileObj) {
        return res.status(400).json({ price: "Picture is required!" });
      }
      goods.picture = await upLoadGoodsPic(fileObj);

      goods
        .save()
        .then(() => res.status(201).send("Goods has been created for user"))
        .catch(next);
    });
};

exports.validateAndSanitizeGoods = [
  body("name", "Goods name is required!").trim().not().isEmpty().escape(),
  body("type", "Type is not valid!").trim().not().isEmpty().isIn(GOODS_TYPE),
  body("price", "Price must be equal to greater then 0!")
    .trim()
    .isFloat({ min: 0 })
    .toFloat(),
  body("remains", "Remains must be equal to greater then 0!")
    .trim()
    .isInt({ min: 1 })
    .toInt(),
  function (req, res, next) {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }
    next();
  },
];

exports.getStoreInfo = async function (req, res, next) {
  let accountId = req.query.account_id;
  let userType = req.query.user_type;
  if (userType != STORE_TYPE) {
    return res.status(401).send("User don't have the authorization!");
  }

  console.log(accountId);

  Store.findOne({ account_id: accountId })
    .populate("storeinfo_id")
    .exec(function (err, store) {
      if (err) return next(err);

      if (!store) {
        return res.status(400).send("User don't have the authorization!");
      }

      res.json(store);
    });
};

async function upLoadGoodsPic(fileObj) {
  const fileName = fileObj.originalname;
  const mimeType = fileObj.mimetype;
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObj.buffer);

  share_link = await drive.uploadFile(
    fileName,
    GOODS_FOLDER,
    mimeType,
    bufferStream
  );

  return share_link;
}
