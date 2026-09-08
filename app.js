const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const Listing = require("./models/listing.js");
const User = require("./models/user.js");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const flash = require("connect-flash");


// ===============================
// DATABASE CONNECTION
// ===============================

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// ===============================
// APP CONFIGURATION
// ===============================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));


// ===============================
// SESSION
// ===============================

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));


// ===============================
// FLASH
// ===============================

app.use(flash());


// ===============================
// PASSPORT
// ===============================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ===============================
// COMMON VARIABLES
// ===============================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.currentUser = req.user;

    next();
});


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.redirect("/listings");

});


// ===============================
// ALL LISTINGS
// ===============================

app.get("/listings", async (req, res) => {

    try {

        const allListings = await Listing.find({});

        res.render("listings/index.ejs", {
            allListings
        });

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/listings");
    }
});


// ===============================
// NEW LISTING FORM
// LOGIN REQUIRED
// ===============================

app.get("/listings/new", (req, res, next) => {

    if (!req.isAuthenticated()) {

        // IMPORTANT
        // User kis page par jana chahta tha
        // us URL ko session mein save karo

        req.session.returnTo = req.originalUrl;

        console.log(
            "Saving returnTo:",
            req.session.returnTo
        );

        req.flash(
            "error",
            "You must be logged in to create the listing!"
        );

        // Session ko save karne ke baad login par jao
        return req.session.save((err) => {

            if (err) {
                return next(err);
            }

            res.redirect("/login");
        });
    }

    // Agar logged in hai to form dikhao
    res.render("listings/new.ejs");
});


// ===============================
// CREATE NEW LISTING
// LOGIN REQUIRED
// ===============================

app.post("/listings", async (req, res, next) => {

    if (!req.isAuthenticated()) {

        // POST request ko dobara automatically
        // submit nahi karna hai.
        // Isliye login ke baad form par bhejenge.

        req.session.returnTo = "/listings/new";

        req.flash(
            "error",
            "You must be logged in to create the listing!"
        );

        return req.session.save((err) => {

            if (err) {
                return next(err);
            }

            res.redirect("/login");
        });
    }

    try {

        const newListing = new Listing(req.body.listing);

        await newListing.save();

        req.flash(
            "success",
            "New listing created successfully!"
        );

        res.redirect("/listings");

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/listings/new");
    }
});


// ===============================
// EDIT LISTING FORM
// LOGIN REQUIRED
// ===============================

app.get("/listings/:id/edit", async (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;

        console.log(
            "Saving returnTo:",
            req.session.returnTo
        );

        req.flash(
            "error",
            "You must be logged in to edit the listing!"
        );

        return req.session.save((err) => {

            if (err) {
                return next(err);
            }

            res.redirect("/login");
        });
    }

    try {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {

            req.flash(
                "error",
                "Listing you requested does not exist!"
            );

            return res.redirect("/listings");
        }

        res.render("listings/edit.ejs", {
            listing
        });

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/listings");
    }
});


// ===============================
// UPDATE LISTING
// LOGIN REQUIRED
// ===============================

app.put("/listings/:id", async (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in to update the listing!"
        );

        return req.session.save((err) => {

            if (err) {
                return next(err);
            }

            res.redirect("/login");
        });
    }

    try {

        const { id } = req.params;

        await Listing.findByIdAndUpdate(
            id,
            {
                ...req.body.listing
            },
            {
                runValidators: true
            }
        );

        req.flash(
            "success",
            "Listing updated successfully!"
        );

        res.redirect(`/listings/${id}`);

    } catch (err) {

        req.flash("error", err.message);

        res.redirect(
            `/listings/${req.params.id}/edit`
        );
    }
});


// ===============================
// DELETE LISTING
// LOGIN REQUIRED
// ===============================

app.delete("/listings/:id", async (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.returnTo = "/listings";

        req.flash(
            "error",
            "You must be logged in to delete the listing!"
        );

        return req.session.save((err) => {

            if (err) {
                return next(err);
            }

            res.redirect("/login");
        });
    }

    try {

        const { id } = req.params;

        const deletedListing =
            await Listing.findByIdAndDelete(id);

        if (!deletedListing) {

            req.flash(
                "error",
                "Listing you requested does not exist!"
            );

            return res.redirect("/listings");
        }

        req.flash(
            "success",
            "Listing deleted successfully!"
        );

        res.redirect("/listings");

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/listings");
    }
});


// ===============================
// SHOW LISTING
// ===============================

app.get("/listings/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {

            req.flash(
                "error",
                "Listing you requested does not exist!"
            );

            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", {
            listing
        });

    } catch (err) {

        req.flash(
            "error",
            "Invalid listing ID!"
        );

        res.redirect("/listings");
    }
});


// ===============================
// SIGNUP FORM
// ===============================

app.get("/signup", (req, res) => {

    if (req.isAuthenticated()) {

        return res.redirect("/listings");
    }

    res.render("users/signup.ejs");
});


// ===============================
// SIGNUP
// ===============================

app.post("/signup", async (req, res, next) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;

        const newUser = new User({
            username: username,
            email: email
        });

        const registeredUser = await User.register(
            newUser,
            password
        );

        req.login(registeredUser, (err) => {

            if (err) {
                return next(err);
            }

            req.flash(
                "success",
                "Welcome to Wanderlust!"
            );

            res.redirect("/listings");
        });

    } catch (err) {

        req.flash(
            "error",
            err.message
        );

        res.redirect("/signup");
    }
});


// ===============================
// LOGIN FORM
// ===============================

app.get("/login", (req, res) => {

    if (req.isAuthenticated()) {

        return res.redirect("/listings");
    }

    res.render("users/login.ejs");
});


// ===============================
// LOGIN
// ===============================

app.post("/login", (req, res, next) => {

    /*
        IMPORTANT:

        Login hone se PEHLE returnTo ko
        session se read kar rahe hain.

        Example:

        returnTo = "/listings/new"

        Isliye login ke baad directly
        /listings/new par jayega.
    */

    const redirectUrl =
        req.session.returnTo || "/listings";

    console.log(
        "Login redirect URL:",
        redirectUrl
    );


    passport.authenticate(
        "local",
        (err, user, info) => {

            // Passport error
            if (err) {
                return next(err);
            }


            // Username/password wrong
            if (!user) {

                req.flash(
                    "error",
                    info?.message ||
                    "Invalid username or password!"
                );

                return res.redirect("/login");
            }


            // User ko login karao
            req.logIn(user, (err) => {

                if (err) {
                    return next(err);
                }


                req.flash(
                    "success",
                    "Welcome back to Wanderlust!"
                );


                // returnTo remove karo
                delete req.session.returnTo;


                // Session save hone ke baad
                // exact page par redirect karo

                req.session.save((err) => {

                    if (err) {
                        return next(err);
                    }

                    console.log(
                        "Redirecting user to:",
                        redirectUrl
                    );

                    return res.redirect(
                        redirectUrl
                    );
                });

            });
        }
    )(req, res, next);
});


// ===============================
// LOGOUT
// ===============================

app.get("/logout", (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "You have been logged out."
        );

        res.redirect("/listings");
    });
});


// ===============================
// 404 ERROR
// ===============================

app.use((req, res) => {

    req.flash(
        "error",
        "Page not found!"
    );

    res.redirect("/listings");
});


// ===============================
// SERVER
// ===============================

app.listen(8080, () => {

    console.log(
        "Server is listening on port 8080"
    );
});