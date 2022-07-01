var mongoose = require("mongoose");
const { param, validationResult } = require("express-validator");
const Goods = require("../models/goods");
const GOOD_TYPES = require("./storeController").GOODS_TYPE;
const { civicinfo } = require("googleapis/build/src/apis/civicinfo");

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
    .select("name type price")
    .sort(sort)
    .exec(function (err, goods) {
      if (err) {
        next(err);
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
    } else next();
  },
  function (req, res, next) {
    console.log(req.params.goods_id);
    Goods.findOne({ _id: req.params.goods_id })
      .populate("store_id")
      .exec(function (err, goods) {
        if (err) {
          next(err);
        }

        res.json(goods);
      });
  },
];
