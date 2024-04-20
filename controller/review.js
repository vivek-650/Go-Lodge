const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const User = require("../models/user.js");

module.exports.createReview = async(req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let{comment, rating} = req.body
    let newReview = new Review({
        comment: comment,
        rating: rating,
        author : req.user._id,
    })
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}