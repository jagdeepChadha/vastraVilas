const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { getproducts, addproducts, updateproduct, deleteproduct, filterproducts, getSingleProduct, getCategories } = require('../controllers/product');

router.get("/categories",getCategories);

router.get("/getSingleProduct/:id", getSingleProduct);

router.get("/filters", filterproducts);

router.get('/getproducts', getproducts);


router.post('/addproduct', upload.single('image'), authMiddleware, adminMiddleware, addproducts);
router.put('/updateproduct/:id', upload.single('image'), authMiddleware, adminMiddleware, updateproduct);
router.delete('/deleteproduct/:id', authMiddleware, adminMiddleware, deleteproduct);


module.exports = router;