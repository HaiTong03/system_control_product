const Order = require("../models/order")

exports.createOrder = async (req, res) => {
  try {
    const { productId, price, qty } = req.body

    // Find existing unpaid order for this product
    const existingOrder = await Order.findOne({
      productId,
      status: "Unpaid",
    })

    if (existingOrder) {
      // Update qty
      const newQty = existingOrder.qty + (qty || 1)
      const newPrice = price || existingOrder.price || 0
      const newTotal = Number((newQty * newPrice).toFixed(2))

      existingOrder.qty = newQty
      existingOrder.price = newPrice
      existingOrder.total = newTotal

      await existingOrder.save()

      return res.status(200).json(existingOrder)
    } else {
      // Always fetch product image from DB
      const Product = require("../models/product")
      const productDoc = await Product.findById(productId)
      // Use product image, or fallback to default placeholder
      const image =
        productDoc && productDoc.image
          ? productDoc.image
          : req.body.image && req.body.image.trim() !== ""
            ? req.body.image
            : "https://placehold.co/100x100?text=No+Image"
      const productName =
        productDoc && productDoc.productname
          ? productDoc.productname
          : req.body.product || ""
      const category =
        productDoc && productDoc.category
          ? productDoc.category
          : req.body.category || ""

      // Create new order
      const newOrder = new Order({
        productId,
        product: productName,
        image,
        category,
        price,
        qty,
        total: Number((price * qty).toFixed(2)),
        status: "Unpaid",
      })

      await newOrder.save()

      return res.status(201).json(newOrder)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("productId")
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update order status (e.g., mark as paid)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params
    const update = req.body
    const order = await Order.findByIdAndUpdate(id, update, { new: true })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params
    await Order.findByIdAndDelete(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
