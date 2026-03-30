const mongoose = require("mongoose")

const userProductActionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productname: { type: String, required: true },
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
  action_by: { type: String, required: true },
  action_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action_user_role: { type: String, default: "user" },
  action_date: { type: Date, default: Date.now },
  old_data: { type: mongoose.Schema.Types.Mixed, default: null },
  new_data: { type: mongoose.Schema.Types.Mixed, default: null },
})

module.exports = mongoose.model("user_product_action", userProductActionSchema)