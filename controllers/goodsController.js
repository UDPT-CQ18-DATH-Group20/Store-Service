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

exports.searchGoods = async function (req, res, next) {
  var filter = {};
  var skip = 0;
  var limit = 100;
  var sort = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
    sort.score = { $meta: "textScore" };
  }

  if (req.query.type) {
    filter.type = { $in: req.query.type };
  }

  filter.available = true;

  if (req.query.limit && req.query.limit < limit) {
    limit = req.query.limit;
  }

  if (req.query.page) {
    skip = (req.query.page - 1) * limit;
  }

  try {
    var goodsCount = await Goods.countDocuments(filter).exec();
    var goods = await Goods.find(filter)
      .select("name type price picture")
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .exec();
  } catch (e) {
    return next(e);
  }

  var result = { data: goods, count: goodsCount };
  res.send(result);
  // Goods.find(filter)
  //   .select("name type price picture")
  //   .skip(skip)
  //   .limit(limit)
  //   .sort(sort)
  //   .exec(function (err, goods) {
  //     if (err) {
  //       return next(err);
  //     }

  //     return res.json(goods);
  //   });
};

exports.getGoods = [
  param("goods_id").isMongoId(),
  function (req, res, next) {
    const errors = myValidationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).send("Goods not founded!");
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
        return res.status(500).send("Internal server error!");
      }

      res.status(201).send("Item has been add to your cart");
    });
};

exports.countSearchDoc = function (req, res, next) {
  var filter = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  if (req.query.type) {
    filter.type = { $in: req.query.type };
  }

  filter.available = true;

  Goods.countDocuments(filter, function (err, count) {
    if (err) return next();

    res.send(count.toString());
  });
};
