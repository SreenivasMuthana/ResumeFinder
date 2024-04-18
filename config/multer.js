const multer = require("multer")
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/resumes");
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + file.originalname);
    },
});

var upload=multer({
    storage:storage,
    // fileFilter:function(req,file,cb){
    //     if(
    //         file.mimetype=="application/pdf" ||
    //         file.mimetype=="application/msword"
    //     ){
    //         cb(null, true)
    //     }else{
    //         console.log("only pdf  or doc files are allowed!");
    //         cb(null,false);
    //     }
    // }
})
// multer({storage:storage})

module.exports=upload