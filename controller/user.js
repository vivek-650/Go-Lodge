const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const User = require("../models/user.js");

module.exports.renderLoginForm = (req, res) => {
    res.render("login.ejs", { error: req.flash("error") })
}

module.exports.renderSignUpForm = (req ,res)=>{
    res.render("signup.ejs", { error: req.flash("error") })
}