const express = require("express")
const router = express.Router()
const paymentController = require("../controller/paymentController")

router.post("/pay", paymentController.payOrder)
router.get("/history", paymentController.getPayments)

module.exports = router
