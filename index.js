const port = 4000
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const multer = require("multer")
const path = require("path")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { error } = require("console")

// Middleware
app.use(express.json())
app.use(cors())

// Database Connection with MongoDB
mongoose
  .connect(
    "mongodb+srv://rajeshkumark1908:rajesh1234@cluster0.xm9qx.mongodb.net/e-commerce"
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err))

// API Creation
app.get("/", (req, res) => {
  res.send("Express App is Running")
})

// Image Store Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "upload/images"))
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

const upload = multer({ storage: storage })

// Serving static files
app.use("/images", express.static(path.join(__dirname, "upload/images")))

// Endpoint for image upload
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" })
  }
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  })
})

// Schema for Creating Products
const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
})

const Product = mongoose.model("Product", ProductSchema)

// Endpoint for adding a product
app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({})
    let id
    if (products.length > 0) {
      let last_product = products.slice(-1)[0]
      id = last_product.id + 1
    } else {
      id = 1
    }

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    })

    await product.save()
    res.json({
      success: true,
      name: req.body.name,
    })
  } catch (error) {
    console.error("Error saving product:", error)
    res.status(500).json({ success: false, message: "Failed to add product" })
  }
})

// Endpoint for deleting a product
app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id })
    res.json({
      success: true,
      name: req.body.name,
    })
  } catch (error) {
    console.error("Error removing product:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to remove product" })
  }
})

// Endpoint for getting all products
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({})
    res.send(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" })
  }
})

// Schema creating for user model

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

// Creating Endpoint for registering the user

app.post("/signup", async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email })
    if (check) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists.",
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    let cart = {}
    for (let i = 0; i < 300; i++) {
      cart[i] = 0
    }

    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      cartData: cart,
    })

    await user.save()

    const data = {
      user: {
        id: user.id,
      },
    }

    const token = jwt.sign(data, process.env.JWT_SECRET || "default_secret")

    res.json({ success: true, token })
  } catch (error) {
    console.error("Error during user registration:", error.message)
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again later.",
    })
  }
})

app.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email })

    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" })
    }

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, error: "Error during password comparison" })
      }

      if (result) {
        const data = {
          user: {
            id: user.id,
          },
        }
        const token = jwt.sign(data, process.env.JWT_SECRET || "default_secret")

        res.json({ success: true, token })
      } else {
        res.status(400).json({ success: false, error: "Wrong password" })
      }
    })
  } catch (error) {
    console.error("Error during login:", error.message)
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again later.",
    })
  }
})

// Starting the server
app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port)
  } else {
    console.error("Error: " + error)
  }
})
