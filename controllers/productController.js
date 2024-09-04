const Product = require("../models/Product")

// Function to add a new product
exports.addProduct = async (req, res) => {
  try {
    let products = await Product.find({})
    let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    })

    await product.save()
    res.json({ success: true, name: req.body.name })
  } catch (error) {
    console.error("Error saving product:", error)
    res.status(500).json({ success: false, message: "Failed to add product" })
  }
}

// Function to remove a product
exports.removeProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id })
    res.json({ success: true, name: req.body.name })
  } catch (error) {
    console.error("Error removing product:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to remove product" })
  }
}

// Function to get all products
exports.getAllProducts = async (req, res) => {
  try {
    let products = await Product.find({})
    res.send(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" })
  }
}
