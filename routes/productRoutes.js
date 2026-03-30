const express = require("express")
const router = express.Router()

const productcontroller = require("../controller/productController")
const { authenticateToken, requireAdmin, requireRoles } = require("../middleware/auth")

//set URL Method Post
router.post("/products", authenticateToken, requireRoles("user", "admin"), productcontroller.createProduct)
router.get("/getallproduct", productcontroller.getallproduct)
router.get("/getproductByID/:id", productcontroller.getallproductByID)
router.put("/products/:id", authenticateToken, requireRoles("user", "admin"), productcontroller.updateProduct)
router.delete("/products/:id", authenticateToken, requireRoles("user", "admin"), productcontroller.deleteProduct)

// Get all product history (old products)
router.get("/product-history", productcontroller.getProductHistory)
router.get("/user-product-actions", authenticateToken, requireAdmin, productcontroller.getUserProductActions)
module.exports = router
