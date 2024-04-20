if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}
//server creation
const express = require("express");
const app = express();
let port = 4567
app.listen(port, (req, res) =>{
    console.log("server connected")
})
//path
const userModel = require("./models/user")
const path = require("path")
const userRouter = require('./models/user');
const methodOverride = require("method-override"); 
// ejs setup
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}))
app.use(express.json())
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync")
const ExpressError = require("./utils/expressError")
const { listingSchema, reviewSchema } = require("./schema.js")
const multer = require("multer");
const {storage} = require("./cloudconfig.js")
const upload  = multer({ storage })
//models import
const Listing = require("./models/listing.js")
const Review = require("./models/review.js")
const User = require("./models/user.js");
//Connection of Database
const mongoose = require("mongoose");

main()
.then((res)=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect("mongodb+srv://vivek650:TOat4IBx0q5C0Vae@cluster0.ilafb48.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}

const flash = require("connect-flash")
app.use(flash());

const expressSession = require("express-session")
app.use(expressSession({
    resave:false,
    saveUninitialized:true,
    secret: "you are my son",
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}));


const passport = require("passport")
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()))

app.use('/users', userRouter);
app.use(passport.initialize());  
app.use(passport.session()); // using password to create session
passport.serializeUser(userRouter.serializeUser());
passport.deserializeUser(userRouter.deserializeUser());
app.use(methodOverride("_method"));

const validateListing = (req, res , next ) =>{
    let {error} = listingSchema.validate(req.body.listing);
    if(error){
        throw new ExpressError(400, "Give valid data");
    }else{
        next();
    }
};

const validateReview = (req, res , next ) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).json(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

const listingController = require("./controller/listing.js")

// index route 
app.get("/", wrapAsync(listingController.index));

app.get("/listings/new",isLoggedIn, listingController.renderNewForm)
app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    res.render("edit.ejs", {listing})
})
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/profile");
});
const searchForm = `
    <form action="/listings/search" method="post">
        <label for="location">Location:</label>
        <input type="text" name="location" id="location">
        <button type="submit">Search</button>
    </form>
`;

// Route for handling the search


// Route for rendering the initial search form


// Route for handling the search using POST method
app.post('/listings/search', async (req, res) => {
    try {
        // Get the location from the request body
        const location = req.body.location;

        if (!location) {
            // If location is not provided, render the search form

        }

        // Use the location to find listings in the database
        const allListing = await Listing.find({ location: { $regex: location, $options: 'i' } });

        // Render search results as cards with images
        res.render("listing.ejs", { allListing })
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put("/listings/:id",upload.single("file"), async(req, res)=>{
    let {id} = req.params;
    let {title, description, image, price, location, country } = req.body
    // console.log("before:", req.body)
    let updatedlisting = await Listing.findByIdAndUpdate(id,
    {   title:title, 
        description:description,
        price:price, 
        location:location, 
        country:country
    }, {new: true})
    let url = req.file.path
    let filename = req.file.filename
    if(typeof req.file !== undefined){
        let url = req.file.path
        let filename = req.file.filename
        updatedlisting.image = {url, filename}
        await updatedlisting.save();
    }
    // console.log("after:",updatedlisting)
    res.redirect("/profile")
});


// show route 
app.get("/listings/:id", wrapAsync(listingController.showListing));

// Route for handling the search


//////////user Section /////////

const userController = require("./controller/user.js");

app.get("/register", userController.renderSignUpForm)
app.get("/login", userController.renderLoginForm);

app.get("/profile", isLoggedIn, async (req, res) => {
    const user1 = await User.findOne({
        username: req.session.passport.user   // req.session.passport.user stores all the  info about the logged in user
    })
    .populate("posts") 
    res.render("profile.ejs", {user1});
});

app.get('/logout', function(req, res, ){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
}) ,(req, res)=>{})

// register route for geting data of user
app.post("/register", (req,res)=>{
    let {username,email,fullname } = req.body
    const userData = new userModel({
        username: username,
        email: email,
        fullname: fullname,
    })
    userModel.register(userData, req.body.password)
    .then(function (){
        passport.authenticate("local")(req, res, () => {
            res.redirect("/login")
        })
    })
})

app.post("/listings", validateListing, upload.single("file") ,wrapAsync(listingController.createListing));

// Review Section 

const reviewController = require("./controller/review.js")
app.post("/listings/:id/reviews", isLoggedIn ,wrapAsync(reviewController.createReview));

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found!"))
})

app.use((err, req, res , next )=>{
    let {statusCode = 500 , message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { statusCode, message })
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
}