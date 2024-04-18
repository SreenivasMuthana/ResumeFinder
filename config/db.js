const mongoose=require('mongoose');
const {MONGODB_URL}=require('./index')

exports.DbConnection= async()=>{
    //connecting to the database using monogdb url  
    await mongoose.connect(MONGODB_URL)
     console.log("Db Connected")
}
