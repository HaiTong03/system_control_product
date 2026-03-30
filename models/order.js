const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tblproducts",
    required: true,
  },
  product: String,
  image: String,
  category: String,
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
  addedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
})

module.exports = mongoose.model("Order", orderSchema)
