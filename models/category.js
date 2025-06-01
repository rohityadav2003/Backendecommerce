const mongoose=require("mongoose");
const createschema=new mongoose.Schema({category:{type:String,required:true},image:{type:[String]},description:{type:String,required:true}},{timestamps:true});
const create=mongoose.model("categories",createschema);
module.exports=create;