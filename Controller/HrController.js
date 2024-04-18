const UserSchema = require("../model/UserSchema")
const hrSchema=require("../model/HrSchema")
const mongoose=require('mongoose')
const {JWT_COOKIE_EXPIRE}=require('../config')
const ErrorResponse=require('../utilities/ErrorResponse')
const path=require('path')
const fs = require('fs');


exports.registerHr= async(req,res)=>{
    try{
        let hr={
            name:req.body.name,
            phone:req.body.phone,
            email:req.body.email,
            password:req.body.password,
            
        }
        let payload=await hrSchema.create(hr)
        res.status(201).json({success:true, message:"Successfully Hr registered",payload})
    } catch(err){
        console.log(err);
    }
}


exports.loginHr = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and a password', 400));
        }
        
        // Check if the user exists
        const user = await hrSchema.findOne({ email }).select('+password');
        
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        
        // Check if the password is correct
        const isPasswordMatch = await user.matchPassword(password);
        
        if (!isPasswordMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        
        // Generate and send token response
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Error logging in HR:', err);
        next(new ErrorResponse('Internal server error', 500));
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


exports.allhrs = async(req,res)=>{
    try{
        let payload=await hrSchema.find({});
        res.status(201).json({success:true,payload})
    }catch(err){
        console.log(err);
    }
}

//! Search documents
exports.searching= async(req, res) => {
try {
    // Extract the field and value from the query parameters
    const { name, phone, email, skills,company, position, years } = req.query;
    // Construct the query dynamically based on the provided field and value
    const query = {};

    if (name) query.name = name;
    if (phone) query.phno = phone;
    if (email) query.email = email;
    if (skills) query.skills = skills;
    if (company) query['experience.company'] = company;
    if (position) query['experience.position'] = position;
    // Handle the special condition for 'years' field
    if (years) {
        const [operator, value] = years.includes(':') ? years.split(':') : ['eq', years];
        switch (operator) {
            case 'gt':
                query['experience.years'] = { $gt: parseInt(value) };
                break;
            case 'gte':
                query['experience.years'] = { $gte: parseInt(value) };
                break;
            case 'lt':
                query['experience.years'] = { $lt: parseInt(value) };
                break;
            case 'lte':
                query['experience.years'] = { $lte: parseInt(value) };
                break;
            case 'eq':
                    query['experience.years'] = { $eq: parseInt(value) };
                    break;
            default:
                return res.status(400).json({ error: "Invalid 'years' operator" });
        }
    }
    // Query the database for matching documents
    const documents = await UserSchema.find(query);
    // Check if any documents are found
    if (documents.length === 0) {
        return res.status(404).json({ error: "No matching documents found" });
    }
    // Send the documents as a response
    res.json(documents);
    }catch (err) {
        console.error('Error fetching documents:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



//!downloading the resume 
exports.getResume = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the user by ID
        const user = await UserSchema.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if resume path exists
        if (!user.resume || !fs.existsSync(user.resume)) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Determine content type based on file extension
        const extname = path.extname(user.resume);
        let contentType = 'application/octet-stream'; // Default content type

        if (extname === '.pdf') {
            contentType = 'application/pdf';
        } else if (extname === '.doc' || extname === '.docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' for .docx
        }

       // Set Content-Disposition header
       res.setHeader('Content-Disposition', `attachment; filename="${path.basename(user.resume)}"`);
       // Set Content-Type header
       res.setHeader('Content-Type', contentType);

       // Stream the file to the response
       const fileStream = fs.createReadStream(user.resume);
       fileStream.pipe(res);

       // Handle stream errors
       fileStream.on('error', (error) => {
           console.error('Error streaming resume:', error);
           res.status(500).json({ error: 'Internal server error' });
       });
    } catch (e) {
        console.log("ERROR IN RETURNING RESUME", e);
        res.status(500).send();
    }
}



//!Delete User
exports.deleteUser=async(req,res)=>{
    const id = req.params.id;
    UserSchema.findByIdAndUpdate(id) 
    .then(deletedUser => {
        if (deletedUser) {
            res.status(201).json({
                        success:true,
                        message:"Successfully deleted User",
                    })
        } else {
            res.status(201).json({
                success:false,
                message:"No user found with the provided ID",
            })
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });

    // try{
    //     let deletePayload=await UserSchema.deleteOne(
    //         { _id:req.params.id},
    //     )
    //     res.status(201).json({
    //         success:true,
    //         message:"Successfully deleted User",deletePayload,
    //     })
    // }catch(err){
    //     console.log(err);
    // }
}
