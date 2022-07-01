var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StoreSchema = new Schema(
  {
    storeinfo_id: {
      type: Schema.Types.ObjectId,
      required: true,
      select: false,
      ref: "StoreInfo",
    },
    profile_id: { type: Schema.Types.ObjectId, required: true, select: false },
    account_id: { type: Schema.Types.ObjectId, required: true, select: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    logo: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    versionKey: false,
    statics: {
      isStoreExisted(accountId, callback) {
        this.countDocuments({ account_id: accountId }, function (err, count) {
          if (err) callback(err);
          if (count > 0) return true;
          else return false;
        });
      },
    },
  }
);

module.exports = mongoose.model("Store", StoreSchema);
