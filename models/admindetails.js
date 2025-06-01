const mongoose=require("mongoose");
const adminschema=new mongoose.Schema({email:{type:String},password:{type:String},name:{type:String}},{timestamps:true});
const admindata=mongoose.model('adminsdetails',adminschema);
module.exports=admindata;
