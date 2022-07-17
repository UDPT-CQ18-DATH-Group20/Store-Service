var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GoodsSchema = new Schema(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Store",
      populate: true,
    },
    name: { type: String, required: true },
    type: { type: String, required: true },
    picture: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    remains: { type: Number, required: true, min: 0 },
    available: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
  }
);

GoodsSchema.pre("save", function (next) {
  if (this.remains <= 0) {
    this.available = false;
  }
  next();
});

GoodsSchema.index({ name: "text" }, { default_language: "none" });

module.exports = mongoose.model("Goods", GoodsSchema);
