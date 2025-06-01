const mongoose=require("mongoose");
const sub=new mongoose.Schema({category:{type:String},subcategory:{type:String},description:{type:String}},{timestamps:true})
const sub1=mongoose.model("sub-categories",sub);
module.exports=sub1;