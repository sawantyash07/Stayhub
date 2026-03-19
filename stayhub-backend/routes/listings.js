const express = require('express');
const router = express.Router();
const Listing = require('../models/listings');
const { isLoggedIn, isOwner } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema } = require('../schema');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Get All Listings
router.get('/', wrapAsync(async (req, res, next) => {
    const listings = await Listing.find({}).populate('owner', 'username');
    res.status(200).json({ success: true, data: listings });
}));

// Get Single Listing
router.get('/:id', wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id).populate('owner', 'username');
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.status(200).json({ success: true, data: listing });
}));

// Create Listing
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing({
        ...req.body,
        owner: req.user._id
    });
    await newListing.save();
    res.status(201).json({ success: true, data: newListing });
}));

// Update Listing
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res, next) => {
    const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id, 
        { ...req.body }, 
        { new: true, runValidators: true }
    );
    if (!updatedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.status(200).json({ success: true, data: updatedListing });
}));

// Delete Listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.status(200).json({ success: true, message: "Listing deleted successfully" });
}));

module.exports = router;
