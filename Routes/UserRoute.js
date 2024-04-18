const {Router}=require("express");
const { Protect,checkWithin24Hours } = require("../middleWares/auth");
const { registerUser,loginUser,updateUserData,deleteUserResume,updateResume} = require("../Controller/userController");
const upload=require('../config/multer')
const router=Router();





router.post("/registerUser",upload.single('resume'),registerUser)
router.post("/loginUser", loginUser);
router.patch("/update-data/:id",Protect,updateUserData)
router.delete("/delete-resume/:id",Protect,checkWithin24Hours,deleteUserResume)
router.patch("/update-resume/:id",Protect,checkWithin24Hours,upload.single('resume'),updateResume)


module.exports=router;