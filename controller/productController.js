// Get all product history (old products)
exports.getProductHistory = async (req, res) => {
  try {
    const history = await ProductHistory.find().sort({ action_date: -1 })
    res.status(200).json(history)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
const Product = require("../models/product")
const ProductHistory = require("../models/product_history")
const UserProductAction = require("../models/user_product_action")

exports.getUserProductActions = async (req, res) => {
  try {
    const actions = await UserProductAction.find().sort({ action_date: -1 })
    res.status(200).json(actions)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const saveProductHistory = async (product, action, user, newData = null) => {
  const actionDate = new Date()
  const historyRecord = product.toObject()

  delete historyRecord._id

  await ProductHistory.create({
    ...historyRecord,
    productId: product._id,
    productname: product.productname,
    action,
    action_by: user?.username || "unknown",
    action_user_id: user?.userId || null,
    action_date: actionDate,
  })

  await UserProductAction.create({
    ...historyRecord,
    productId: product._id,
    productname: product.productname,
    action,
    action_by: user?.username || "unknown",
    action_user_id: user?.userId || null,
    action_user_role: user?.role || "user",
    action_date: actionDate,
    old_data: historyRecord,
    new_data: newData,
  })
}

const buildUpdatedSnapshot = (product, updates) => {
  const currentData = product.toObject()
  const nextData = {
    ...currentData,
    ...updates,
  }

  const nextQty = Number(nextData.qty ?? currentData.qty ?? 0)
  const nextPrice = Number(nextData.price ?? currentData.price ?? 0)
  nextData.amount = nextQty * nextPrice

  return nextData
}

//create method POST product
// module.exports= async(req,res)=>{
exports.createProduct = async (req, res) => {
  try {
    const addproduct = new Product(req.body)
    await addproduct.save()
    res.status(201).json(addproduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Create method GET getall product
exports.getallproduct = async (req, res) => {
  try {
    const listproduct = await Product.find()
    res.status(200).json(listproduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Create method GET productByID
exports.getallproductByID = async (req, res) => {
  try {
    const getallproductByID = await Product.findById(req.params.id)
    if (!getallproductByID) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json(getallproductByID)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Create method PUT update product by ID
exports.updateProduct = async (req, res) => {
  try {
    // Find the old product first
    const oldProduct = await Product.findById(req.params.id)
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" })
    }
    const updatedSnapshot = buildUpdatedSnapshot(oldProduct, req.body)
    await saveProductHistory(oldProduct, "edited", req.user, updatedSnapshot)
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
    res.status(200).json(updatedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Create method DELETE product by ID
const mongoose = require("mongoose")
exports.deleteProduct = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Product not found" })
    }
    // Find the product before deleting
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    await saveProductHistory(product, "deleted", req.user, null)
    // Delete product
    await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
