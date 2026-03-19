const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    location: String,
    country: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', listingSchema);
