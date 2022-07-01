var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var StoreInfoSchema = new Schema(
  {
    established_date: { type: Date, required: true },
    opening_time: { type: String, required: true },
    closing_time: { type: String, required: true },
    goods_type: [{ type: String, required: true }],
    receptionist_name: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Store_Info", StoreInfoSchema);
