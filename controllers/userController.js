const Users = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Register a new user
exports.signup = async (req, res) => {
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

    const data = { user: { id: user.id } }
    const token = jwt.sign(data, process.env.JWT_SECRET || "default_secret")

    res.json({ success: true, token })
  } catch (error) {
    console.error("Error during user registration:", error.message)
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again later.",
    })
  }
}

// Login user
exports.login = async (req, res) => {
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
        const data = { user: { id: user.id } }
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
}
