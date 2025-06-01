const express = require("express");
const app = express();
const Users = require("../models/users");
const router = express.Router();
router.get("/mail-varification", async (req, res) => {
  try {
    if (req.query.id == undefined) {
      return res.render("404");
    }
    const userData = await Users.findOne({ _id: req.query.id });
    if (userData) {
        if(userData.is_verified==1){
            return res.render("mail-varification", { message: "your mail already verified" });   

        }
      await Users.findByIdAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            is_verified: 1,
          },
        });
        return res.render('mail-varification',{message:"mail has been verified successfully "})
    } 
    else {
      return res.render("mail-varification", { message: "user not found" });
    }
  } catch (err) {
    console.log(err.message);
    return res.render("404");
  }
});
module.exports = router;
