const express = require("express")
const cors = require("cors")
require("dotenv").config()
const port = 3000
const app = express()
const connectDB = require("./config/db")

const productrouter = require("./routes/productRoutes")
const paymentRouter = require("./routes/paymentRoutes")
const orderRouter = require("./routes/orderRoutes")
const userRouter = require("./routes/userRoutes")

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static(__dirname))
app.use("/api", productrouter)
app.use("/api/payment", paymentRouter)
app.use("/api/orders", orderRouter)
app.use("/api/users", userRouter)

const startServer = async () => {
  try {
    await connectDB()
    // Insertdata();
    app.listen(port, () => {
      console.log(`Server is running with:\n        http://localhost:${port}`)
    })
  } catch (error) {
    console.error("Server startup failed:", error.message)
    process.exit(1)
  }
}

startServer()
