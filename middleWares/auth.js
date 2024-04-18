const jwt=require( "jsonwebtoken" );
const {JWT_SECRET}=require( "../config");
const UserSchema=require("../model/UserSchema")
const ErrorResponse=require('../utilities/ErrorResponse')


exports.Protect=async (req,res,next)=>{
    let token;
    if( req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    {
            token=req.headers.authorization.split(" ")[1]
    }
    if(!token){
                return  next(new ErrorResponse( 'Unauthorized',401));  
                 
             }
             
        //decode the token and get the user id from it
     try{
         //verify  the token
        const decoded=await jwt.verify(token , JWT_SECRET);
        console.log(decoded)
         //the token is verified successfully so we can add the user to the request object
        req.user= await UserSchema.findById(decoded.id);//we do not want to send back the password;
        // console.log(req.user)
         //proceed to the next middleware in the route
         next();
     }catch(err){
         return next(new ErrorResponse('Not authorize to perform this action','401'));
 }
}


//Grant access  to specific roles
exports.authorize=(...roles)=> {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
          return next( new ErrorResponse('Not Authorized To Perform This Action',403))  
        }
        next();
    }
}

exports.checkWithin24Hours = async (req, res, next) => {
    try {
        // Get user's creation timestamp
        const user = await UserSchema.findById(req.params.id);
        const creationTime = user.createdAt;

        // Calculate time difference
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime - creationTime);
        const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

        // If more than 24 hours have passed, deny the operation
        if (hoursDifference > 24) {
            return res.status(403).json({ error: 'Operation not allowed after 24 hours of user creation' });
        }

        // Otherwise, allow the operation
        next();
    } catch (error) {
        console.error('Error checking within 24 hours:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};












