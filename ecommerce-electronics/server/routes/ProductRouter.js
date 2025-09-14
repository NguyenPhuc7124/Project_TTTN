const express = require("express");
const router = express.Router()
const productController = require('../controllers/ProductController');
const { authMiddleWare } = require('../middleware/authMiddleWare');


router.post('/create', productController.createProduct)
router.put('/update/:id', authMiddleWare, productController.updateProduct)
router.get('/get-detail/:id', productController.getDetailsProduct)
router.get('/get-all', productController.getAllProduct)
router.delete('/delete-product/:id', authMiddleWare, productController.deleteProduct)
router.post('/delete-many', authMiddleWare, productController.deleteManyProduct)
router.get('/get-all-type', productController.getAllType)

module.exports = router