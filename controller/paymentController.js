const Payment = require("../models/payment")
const Order = require("../models/order")

// Create or update payment (partial or full)
exports.payOrder = async (req, res) => {
  try {
    const { orderId, method, amount, paymentScope, payQty } = req.body
    const payAmount = Number(req.body.payAmount)
    
    // Fetch order to get product name
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    if (paymentScope === "product") {
      const quantity = Number(payQty || 0)

      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Invalid product quantity" })
      }

      if (quantity > Number(order.qty || 0)) {
        return res.status(400).json({ error: "Product quantity exceeds order quantity" })
      }

      const payment = await Payment.create({
        orderId,
        productName: order.product,
        method,
        amount: payAmount,
        paidAmount: payAmount,
        paymentType: "product",
        quantity,
        unitPrice: Number(order.price || 0),
        status: "paid",
        history: [{ paidAmount: payAmount, method }],
      })

      return res.json(payment)
    }
    
    let payment = await Payment.findOne({ orderId, paymentType: "order" })
    if (!payment) {
      payment = new Payment({
        orderId,
        productName: order.product,
        method,
        amount,
        paymentType: "order",
        quantity: Number(order.qty || 0),
        unitPrice: Number(order.price || 0),
        paidAmount: 0,
        status: "unpaid",
        history: [],
      })
    }

    if (!payment.quantity) {
      payment.quantity = Number(order.qty || 0)
    }

    if (!payment.unitPrice) {
      payment.unitPrice = Number(order.price || 0)
    }

    payment.paidAmount += payAmount
    payment.history.push({ paidAmount: payAmount, method })
    if (payment.paidAmount >= payment.amount) {
      payment.status = "paid"
      payment.paidAmount = payment.amount
    } else if (payment.paidAmount > 0) {
      payment.status = "partial"
    }
    await payment.save()
    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get all payment histories
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("orderId")
    res.json(payments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
