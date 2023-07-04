const Product = require("../models/ProductModel");
const Review = require("../models/ReviewModel");

// Create a new product
exports.uploadProduct = async (req, res) => {
  try {
    const { title, description, price, duration, tags, category } = req.body;
    const fileUrl = req.file.path

    const product = await Product.create({
      title,
      description,
      price,
      duration,
      seller: req.user.userId, // Assuming the user ID is stored in the req.user object after authentication
      tags,
      category,
      fileUrl
    });

    res.status(201).json({ message: 'Product uploaded successfully', product });
  } catch (error) {
    console.log(error, "error");
    res
      .status(500)
      .json({ error: "An error occurred while uploading the product" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email"); // Populate the seller information from the User model
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

// Search products by keyword, category, or tags
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category, tags } = req.query;
    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    const products = await Product.find(query).populate("seller", "name email");
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while searching for products" });
  }
};

// Get product details
exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate(
      "seller",
      "name email"
    );
    const reviews = await Review.find({ productId }).populate(
      "customerId",
      "name"
    );

    res.json({ product, reviews });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product details" });
  }
};

// Add a review for a product
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const customerId = req.user.userId;

    const review = await Review.create({
      productId,
      customerId,
      rating,
      comment,
    });
    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.log(error, 'error')
    res
      .status(500)
      .json({ error: "An error occurred while adding the review" });
  }
};
