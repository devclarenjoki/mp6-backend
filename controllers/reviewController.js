// const Product = require('../models/productModel');
// const Review = require('../models/ReviewModel');

// // Get product details
// exports.getProductDetails = async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const product = await Product.findById(productId).populate('seller', 'name email');
//     const reviews = await Review.find({ productId }).populate('customerId', 'name');

//     res.json({ product, reviews });
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while fetching the product details' });
//   }
// };

// // Add a review for a product
// exports.addReview = async (req, res) => {
//   try {
//     const { productId, rating, comment } = req.body;
//     const customerId = req.user._id;

//     const review = await Review.create({ productId, customerId, rating, comment });
//     res.status(201).json({ message: 'Review added successfully', review });
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while adding the review' });
//   }
// };
