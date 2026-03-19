const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

// View Wishlist
router.get('/', wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.render('wishlists/index', { wishlists: user.wishlist });
}));

// Add to / Remove from Wishlist
router.post('/:id/toggle', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(id)) {
        await User.findByIdAndUpdate(user._id, { $pull: { wishlist: id } });
        // In a real app we would flash a message here
    } else {
        user.wishlist.push(id);
        await user.save();
    }

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
