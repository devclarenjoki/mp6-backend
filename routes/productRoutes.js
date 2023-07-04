const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const multer = require("multer");

const upload = multer({
  dest: "uploads/",
});

router.get("/", productController.getAllProducts);
router.post(
  "/",
  authenticate,
  uploadMiddleware,
//   upload.single("fileUrl"),
  productController.uploadProduct
);
router.get("/search", productController.searchProducts);
router.get("/:productId", productController.getProductDetails);
router.post("/:productId/reviews", authenticate, productController.addReview);
// router.post("/test", handlers, any)
module.exports = router;
