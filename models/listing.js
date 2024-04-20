const mongoose = require("mongoose");
const { Schema } = mongoose;
main()
.then((res)=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect("mongodb+srv://vivek650:TOat4IBx0q5C0Vae@cluster0.ilafb48.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}

// schema creation 

const listingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    image:{
        url : String,
        filename: String,
    },
    price:{
        type: Number,
        required: true,
    },
    location:{
        type: String
    },
    country:{
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});


// model creation

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;