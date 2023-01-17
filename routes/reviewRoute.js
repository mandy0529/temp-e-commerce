// express require
const express = require("express");

// middleware require
const { authenticateUser } = require("../middleware/authentication");

// controllers require
const {
        createReview,
        getAllReviews,
        getSingleReview,
        updateReview,
        deleteReview
} = require("../controllers/reviewController");

// -------------------------------------------

// router
const router = express.Router();

// REST setup
router.route("/").post(authenticateUser, createReview).get(getAllReviews);

router.route("/:id")
    .get(getSingleReview)
    .delete(authenticateUser, deleteReview)
    .patch(authenticateUser, updateReview);

// exports
module.exports = router;

