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
// schema creation 

const reviewSchema = new mongoose.Schema({
    comment:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})

// model creation

const Review = mongoose.model("Review",reviewSchema);
module.exports = Review;