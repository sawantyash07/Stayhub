const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.js');
const mongoose = require('mongoose');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');


// View Booking History
router.get('/', wrapAsync(async (req, res, next) => {
    const bookings = await Booking.find({ userId: req.user._id }).populate('listingId').sort({ createdAt: -1 });
    res.render('bookings/index', { bookings });
}));

// Booking Confirmation Page
router.get('/:id/confirmation', wrapAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('listingId');
    if(!booking) {
        throw new ExpressError(404, "Booking not found");
    }
    res.render('bookings/confirmation', { booking });
}));

module.exports = router;
