const plm = require("passport-local-mongoose")
// connecting DB 

const mongoose = require("mongoose");

main().then((res)=>{
    console.log("connection secured")
})
.catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect("mongodb+srv://vivek650:TOat4IBx0q5C0Vae@cluster0.ilafb48.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}

// creating schema for user

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required : true,
    },
    username: {
        type: String,
        required : true,
        unique : true,
    },
    password: {
        type: String,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    dp: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }
});
userSchema.plugin(plm);
// Creating model using defined Schema and exporting

module.exports = mongoose.model('User', userSchema);



