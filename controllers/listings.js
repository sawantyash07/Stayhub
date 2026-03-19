const Listing = require('../models/listings.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require('../utils/ExpressError.js');

module.exports.index = async (req, res) => {
    let query = {};
    const { location, country, min_price, max_price, category, search, page = 1, limit = 12 } = req.query;

    if (search) {
        query.$or = [
            { location: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    if (country) {
        query.country = { $regex: country, $options: 'i' };
    }
    if (category && category !== 'All') {
        query.category = category;
    }
    if (min_price || max_price) {
        query.price = {};
        if (min_price) query.price.$gte = Number(min_price);
        if (max_price) query.price.$lte = Number(max_price);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const allListings = await Listing.find(query).skip(skip).limit(limitNum);
    const totalListings = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalListings / limitNum);

    res.render('listings/index', { 
        allListings, 
        queryParams: req.query, 
        currentPage: pageNum, 
        totalPages,
        limit: limitNum
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new');
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render('listings/show', { listing });
};

module.exports.createListing = async (req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    let response;
    try {
        response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();
    } catch (e) {
        console.warn("Geocoding failed:", e.message);
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    if (response && response.body.features && response.body.features.length > 0) {
        newListing.geometry = response.body.features[0].geometry;
    } else {
        newListing.geometry = { type: 'Point', coordinates: [0, 0] };
    }
    
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render('listings/edit', { listing });
};

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    if (!listing) {
        throw new ExpressError(404, "Listing you requested for, does not exist");
    }

    if (req.body.listing.location && req.body.listing.location !== listing.location) {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (response.body.features && response.body.features.length > 0) {
            listing.geometry = response.body.features[0].geometry;
            await listing.save();
        }
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');
};
