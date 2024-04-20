const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const User = require("../models/user.js");


module.exports.index = async (req,res, next) =>{
    const allListing = await Listing.find({})
    res.render("listing.ejs", { allListing })
}

module.exports.renderNewForm = (req, res)=>{
    res.render("new.ejs")
};

module.exports.showListing = async (req, res, next) =>{
    
    let {id} = req.params
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate: {
            path: "author",
        },
    })
    .populate("owner");  
    // console.log(listing)
    res.render("show.ejs", { listing });
}

module.exports.createListing = async (req,res, next)=>{
    let url = req.file.path
    let filename = req.file.filename
    let {title, description, image, price, location, country } = req.body 
    if (isNaN(Number(price))) {
        throw new ExpressError(400, "Invalid Price! Please enter valid data");
    }
    const newlisting = new Listing({
        title: title,
        description: description,
        price: price,
        country: country,
        location: location,
    })
    // console.log(newlisting)
    newlisting.owner = req.user._id; 
    newlisting.image = {url, filename}
    await newlisting.save()
    const user = await User.findOne({
        username: req.session.passport.user   // req.session.passport.user stores all the  info about the logged in user
    })
    user.posts.push(newlisting)
    await user.save()
    // console.log(user.posts)
    res.redirect("/")
}