const mongoose=require("mongoose");
const usersschema=new mongoose.Schema({name:{type:String,required:true},mobile:{type:Number,required:true},email:{type:String,required:true},isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,password:{type:String,required:true},createdAt: { type: Date, default: Date.now }});
const Users=mongoose.model("Users",usersschema);
module.exports=Users;