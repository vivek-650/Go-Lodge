const mongoose = require("mongoose")
const initData = require("./smpleData")
const Listing = require("../models/listing.js")



main()
.then((res)=>{
    console.log("done")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/golodge")
}


const initDB = async ()=>{
    await Listing.deleteMany({}) 
    initData.data = initData.data.map((obj)=>({...obj, owner: "65743f98c5ec671af6f50c20"}))
    await Listing.insertMany(initData.data) 
    console.log("all data pushed")
}

initDB();