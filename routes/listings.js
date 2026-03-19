const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listings.js');
const listingsController = require('../controllers/listings.js');
const { validateListing, isLoggedIn, isOwner } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(listingsController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingsController.createListing));

// New Route
router.get('/new', isLoggedIn, listingsController.renderNewForm);

router.route('/:id')
    .get(wrapAsync(listingsController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingsController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

// Edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

module.exports = router;
