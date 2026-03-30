const mongoose = require("mongoose")
// create productschema object
const productschema = new mongoose.Schema({
  productname: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, default: 0 },
  amount: {
    type: Number,
    default: function () {
      return this.qty * this.price
    },
  },
  category: { type: String, default: "" },
  type: { type: String, default: "" },
  image: { type: String, default: "" },
  description: { type: String, default: "" },
  status: { type: Boolean, default: true },
  created_date: { type: Date, default: Date.now },
})
// Auto compute amount = qty * price on save and update
productschema.pre("save", function () {
  this.amount = this.qty * this.price
})
productschema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate()
  if (update.qty !== undefined && update.price !== undefined) {
    update.amount = update.qty * update.price
  }
})
// Create collection name tblproducts in mongoose
module.exports = mongoose.model("tblproducts", productschema)
