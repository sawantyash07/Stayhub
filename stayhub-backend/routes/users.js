const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

// Signup
router.post('/signup', wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully", data: newUser });
}));

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.status(200).json({ success: true, message: "Logged in successfully", data: req.user });
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(new ExpressError(500, "Error logging out")); }
        res.status(200).json({ success: true, message: "Logged out successfully" });
    });
});

module.exports = router;
