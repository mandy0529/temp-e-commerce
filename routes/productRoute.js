// express require
const express = require("express");

// router require
const router = express.Router();

// authenticate function require
const {
        authenticateUser,
        authorizePermissions
      } = require("../middleware/authentication");

// productController require
const {
        createProduct,
        getAllProducts,
        getSingleProduct,
        updateProduct,
        deleteProduct,
        uploadImage
      } = require("../controllers/productController");

// reviewController require
const { getSingleProductReviews } = require("../controllers/reviewController");
// ----------------------------------------------------

// get all products, create product
router.route("/").post([authenticateUser, authorizePermissions("admin")],
  createProduct
).get(getAllProducts);

// upload image
router.route("/uploadImage").post(
  [authenticateUser, authorizePermissions("admin")], uploadImage);

// get single product, update product, delete product
router.route("/:id").get(getSingleProduct).patch(
  [authenticateUser, authorizePermissions("admin")], updateProduct).delete(
  [authenticateUser, authorizePermissions("admin")], deleteProduct);

// get Single Product Review
router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;