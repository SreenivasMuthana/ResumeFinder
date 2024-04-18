const {Router}=require("express");
const { registerHr,loginHr,allhrs,searching,getResume,deleteUser } = require("../Controller/HrController");
const mimeTypes = require('mime-types');
const { Protect, authorize } = require("../middleWares/auth");

const router=Router();

router.post("/registerHr",registerHr)
router.post("/Hrlogin",loginHr)
router.get("/allhrs",Protect,allhrs)
router.get("/searchdocuments",Protect,searching)
router.get("/downloadResume/:id",Protect,getResume)
router.delete("/deleteUser/:id",Protect,deleteUser)


module.exports=router;