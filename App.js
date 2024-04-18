//Resume Finder Application:

const express=require( 'express');
const {PORT,MONGODB_URL}=require("./config")
const AppSchema=require('./model/UserSchema');
const { DbConnection } = require('./config/db');
const hrRoute=require('./Routes/HrRoute')
const userRoute=require('./Routes/UserRoute')
const errorHandler=require('./middleWares/error')
const swaggerDocs= require('./swagger')
  
const app = express();

DbConnection();


app.use(express.json());

//!static path
app.use("/user",userRoute)
app.use("/hr",hrRoute)

app.use(errorHandler)



app.listen(PORT || 5000, err=>{
    if (err)  throw err;
    swaggerDocs(app, PORT)
    console.log('App is running on port 5000')
})

try {
    
} catch (error) {
    
}