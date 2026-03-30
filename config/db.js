const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.mongoUri ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/mongodb_Tong"
    await mongoose.connect(mongoUri)
    console.log("Mongo connect successfully!")
  } catch (error) {
    console.error("Connection mongodb failed:", error.message)
    throw error
  }
}

module.exports = connectDB
