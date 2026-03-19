const Listing = require('../models/listings');

module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized: You must be logged in" });
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        if (!listing.owner.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not the owner of this listing" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
