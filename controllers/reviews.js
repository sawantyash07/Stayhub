const Listing = require('../models/listings.js');
const Review = require('../models/review.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    newReview.listing = listing._id;
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("success", "Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    
    let review = await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
