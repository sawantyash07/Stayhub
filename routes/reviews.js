const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const reviewsController = require('../controllers/reviews.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

// Create Review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

// Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.destroyReview));

module.exports = router;
