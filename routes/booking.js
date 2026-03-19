const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listings.js');
const Booking = require('../models/booking.js');
const mongoose = require('mongoose');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');



// Create Booking
router.post('/', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const { checkInDate, checkOutDate } = req.body.booking;

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
        listingId: id,
        $or: [
            {
                checkInDate: { $lt: checkOutDate },
                checkOutDate: { $gt: checkInDate }
            }
        ]
    });

    if (overlappingBookings.length > 0) {
        throw new ExpressError(400, "These dates are already booked! Please go back and choose different dates.");
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut - checkIn;
    const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    
    // Prevent <= 0 nights booking
    if (nights <= 0) {
        throw new ExpressError(400, "Check-out date must be strictly after the check-in date.");
    }

    const basePrice = listing.price * nights;
    const cleaningFee = 1000;
    const serviceFee = Math.floor(basePrice * 0.14);
    const totalPrice = basePrice + cleaningFee + serviceFee;

    const newBooking = new Booking({
        userId: req.user._id,
        listingId: listing._id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        totalPrice: totalPrice
    });

    await newBooking.save();

    res.redirect(`/bookings/${newBooking._id}/confirmation`);
}));

module.exports = router;
