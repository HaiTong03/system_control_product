const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  productName: { type: String, required: true },
  method: { type: String, enum: ["លុយក្រៅ", "ធនាគារ"], required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, required: true, default: 0 },
  paymentType: {
    type: String,
    enum: ["order", "product"],
    default: "order",
  },
  quantity: { type: Number, default: null },
  unitPrice: { type: Number, default: null },
  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  history: [
    {
      paidAmount: Number,
      date: { type: Date, default: Date.now },
      method: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Payment", paymentSchema)
