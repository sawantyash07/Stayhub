require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo') || require('connect-mongo');
const sessionStore = require('connect-mongo').default || require('connect-mongo').MongoStore;
const passport = require('passport');

const ExpressError = require('./utils/ExpressError');
const wrapAsync = require('./utils/wrapAsync');

const app = express();

// Database Connection
const dbUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/stayhub';
mongoose.connect(dbUrl)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Store config
const store = sessionStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || 'stayhubsecret',
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Sessions
const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET || 'stayhubsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const listingRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');

app.use('/listings', listingRoutes);
app.use('/', userRoutes);

// Invalid Route Error Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Backend API is listening on port ${PORT}`);
});
