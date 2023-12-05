const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/top-tour', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.render("/login");
    }
}

app.get("/", function (req, res) {
    res.render("home.ejs");
})



app.get("/register", function (req, res) {
    res.render("register");
});


app.post("/register", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("/dashboard");
    }
    else {
        User.register(
            { email: req.body.email },
            req.body.password,
            function (err, user) {
                if (err) {
                    console.log(err);
                }
                else {
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/");
                    })
                }
            }
        );
    }
});



app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login", function (req, res) {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        }
    });

});

app.listen(3000, function () {
    console.log("Server is running at port 3000");
});
