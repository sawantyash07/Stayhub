if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const cookieParser = require('cookie-parser');
const ExpressError = require('./utils/ExpressError.js');
const listingRoutes = require('./routes/listings.js');
const reviewRoutes = require('./routes/reviews.js');
const bookingRoutes = require('./routes/booking.js');
const userBookingRoutes = require('./routes/user-bookings.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/users.js');
const { MongoStore } = require('connect-mongo');



const dbUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayhub';

mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    family: 4,
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secretcode'));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

let store;
try {
    store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: "mysupersecretcode"
        },
        touchAfter: 24 * 3600
    });

    store.on("error", (err) => {
        console.log("Error in Mongo Session Store:", err);
    });
} catch (e) {
    console.error("Failed to create MongoStore:", e);
}


const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.mapToken = process.env.MAPBOX_TOKEN;
    next();
});

app.use('/', userRoutes);

const wishlistRoutes = require('./routes/wishlists.js');
app.use('/wishlists', wishlistRoutes);

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/listings/:id/bookings', bookingRoutes);
app.use('/bookings', userBookingRoutes);

app.get('/', (req, res) => {
    res.redirect('/listings');
});

// Cookie Routes
app.get('/getcookies', (req, res) => {
    res.cookie('greet', 'hello', { signed: false });
    res.cookie('madeIn', 'India', { signed: true });
    res.send('Sent you some cookies!');
});

app.get('/verify', (req, res) => {
    console.log("Unsigned Cookies:", req.cookies);
    console.log("Signed Cookies:", req.signedCookies);
    res.send({
        unsigned: req.cookies,
        signed: req.signedCookies
    });
});

app.get("/sessioncount", (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You visited this page ${req.session.count} times`);
});

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error.ejs', { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
