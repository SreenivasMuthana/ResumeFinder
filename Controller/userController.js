const UserSchema=require("../model/UserSchema")
const mongoose=require('mongoose')
const {JWT_COOKIE_EXPIRE}=require('../config')
const ErrorResponse=require('../utilities/ErrorResponse')
const path=require('path')
const fs = require('fs');




exports.registerUser= async(req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const allowedFileTypes = ['.pdf', '.doc', '.docx']; // Add more file types if needed
        const extname = path.extname(req.file.originalname).toLowerCase();
        if (!allowedFileTypes.includes(extname)) {
            return res.status(400).json({ error: "Only PDF or DOC files are allowed!" });
        }
        let user={
            name:req.body.name,
            phone:req.body.phone,
            email:req.body.email,
            password:req.body.password,
            skills:req.body.skills,
            experience:req.body.experience,
            resume:req.file.path
            
        }
        let payload=await UserSchema.create(user)
        res.status(201).json({success:true, message:"Successfully Submitted and you can update your resume only within 24hrs",payload})
    } catch(err){
        console.log(err);
    }
}



//!login User
exports.loginUser = async (req, res,next) => {
    try{
        const {email,password}= req.body;
        
        if(!email || !password) 
        {
            return next(new ErrorResponse('Please provide an email and a password'),400);
        }
        //check user exists or not
        const user = await UserSchema.findOne( { email }).select( '+password' );
    
        if (!user) {
          return next( new ErrorResponse("User not Exists", 401));
        }
    
        //Check if the password is correct
        const matchPassword = await user.matchPassword(password);
    
        if(!matchPassword) {
            return next(new ErrorResponse("Incorrect Password", 401))
        }
        sendTokenResponse(user,201,res)      
    } catch(err) {
        console.log(err.message);
    }
  
};

const sendTokenResponse= (user , statusCode ,res )=> {
    //create token
    let id=user._id;
    let token=user.getSignedJWTToken();
    let options={
      expires : new Date(Date.now() + JWT_COOKIE_EXPIRE *24*60*60*1000),
      httpOnly: true//it means that the cookies are only accessible through HTTP(not JS)and CSS
    };
    if(process.env === "production"){
        options.secure =true //only works when https is used
    }
    //send token to client side with  set-cookie option in header
    res
    .status(statusCode)
    .json({
        success: true,
        token,id})
    .cookie('token',token,options)
}


//!Update Data
exports.updateUserData = async (req, res) => {
    try {
        let updatePayload = await UserSchema.updateOne(
            { _id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!updatePayload) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(201).json({
            success: true,
            message: "Successfully updated data",
            updatePayload,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




//!Delete Resume
exports.deleteUserResume = async (req, res) => {
    try {
        // Update the document to remove the resume field
        await UserSchema.updateOne(
            { _id: req.params.id },
            { $unset: { resume: "" } }
        );
        // Send success response
        res.status(200).json({
            success: true,
            message: "Resume field deleted successfully",
        });
    } catch (error) {
        console.error(error);
    }
};


//! Update Resume
exports.updateResume = async (req, res) => {
    try {
        // Extract the file path from req.file
        const resumePath = req.file.path;

        // Update the resume field with the file path
        let payloadWithResume = await UserSchema.updateOne(
            { _id: req.params.id },
            { $set: { resume: resumePath } },
            { new: true }
        );

        res.status(201).json({
            success: true,
            message: "Successfully Resume Updated",
            payloadWithResume,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};






