const mongoose = require("mongoose")

const productHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productname: String,
  qty: Number,
  price: Number,
  amount: Number,
  category: String,
  type: String,
  image: String,
  description: String,
  status: Boolean,
  created_date: Date,
  action: { type: String, enum: ["deleted", "edited"], required: true },
  action_by: { type: String, default: null },
  action_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action_date: { type: Date, default: Date.now },
})

module.exports = mongoose.model("product_history", productHistorySchema)
