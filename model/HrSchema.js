const {Schema,model}=require( 'mongoose');

const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const { JWT_SECRET,JWT_EXPIRE } = require("../config")

let hrSchema=new Schema({
    role:{
    type:String, 
    default: "hr",
    required:false
    }, // admin or user
    name:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    password:{
        type:String,
        required:true,
    },
},
    {timestamps:true},
)


hrSchema.pre("save",async function(){
  let salt=await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password, salt);
})

hrSchema.methods.matchPassword=async  function(enteredpassword){
 return await bcrypt.compare(enteredpassword, this.password)
}

hrSchema.methods.getSignedJWTToken=function() {
  //@ts-ignore
  return jwt.sign({id:this._id},JWT_SECRET ,{expiresIn:JWT_EXPIRE});
};


module.exports=model("hr",hrSchema);