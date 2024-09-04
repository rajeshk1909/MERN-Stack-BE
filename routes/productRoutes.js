const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")

router.post("/addproduct", productController.addProduct)
router.post("/removeproduct", productController.removeProduct)
router.get("/allproducts", productController.getAllProducts)

module.exports = router
