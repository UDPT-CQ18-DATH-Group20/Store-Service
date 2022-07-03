const mongoose = require("mongoose");
const { param, validationResult } = require("express-validator");
const Goods = require("../models/goods");
const GOOD_TYPES = require("./storeController").GOODS_TYPE;
const brooker = require("../services/message_publisher");

brooker.start();

const myValidationResult = validationResult.withDefaults({
  formatter: (error) => {
    return error.msg;
  },
});

exports.allGoodsType = function (req, res, next) {
  res.send(GOOD_TYPES);
};

exports.searchGoods = function (req, res, next) {
  var filter = {};
  var sort = {};

  console.log(req.query.type);
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
    sort.score = { $meta: "textScore" };
  }
  if (req.query.type) {
    filter.type = { $in: req.query.type };
  }

  filter.available = true;

  Goods.find(filter)
    .select("name type price picture")
    .sort(sort)
    .exec(function (err, goods) {
      if (err) {
        return next(err);
      }

      return res.json(goods);
    });
};

exports.getGoods = [
  param("goods_id").isMongoId(),
  function (req, res, next) {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send("Goods id is not valid!");
    }
    next();
  },
  function (req, res, next) {
    Goods.findOne({ _id: req.params.goods_id })
      .populate("store_id")
      .exec(function (err, goods) {
        if (err) {
          return next(err);
        }

        res.json(goods);
      });
  },
];

exports.addGoodsToCart = function (req, res, next) {
  let accountId = req.query.account_id;
  Goods.findOne({ _id: req.params.goods_id })
    .select("id name picture price")
    .exec(function (err, goods) {
      if (err) {
        return next(err);
      }

      //Câu lệnh gọi message brooker
      goods = goods.toObject();
      quantity = req.query.quantity || 1;

      const flag = brooker.publishItemToCart(goods, quantity, accountId);
      if (!flag) {
        return res.status(500).send("Server can't serve your request!");
      }

      res.send("Item has been add to your cart");
    });
};
