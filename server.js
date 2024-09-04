// server.js
const express = require("express")
const app = express()
const path = require("path")
const cors = require("cors")
const connectDB = require("./config/db")

// Middleware
app.use(express.json())
app.use(cors())

// Connect to the database
connectDB()

// Serving static files
app.use("/images", express.static(path.join(__dirname, "upload/images")))

// Routes
const productRoutes = require("./routes/productRoutes")
const userRoutes = require("./routes/userRoutes")

app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
