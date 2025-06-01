const mongoose=require("mongoose");
const addschema=new mongoose.Schema({username:{type:String},address:{type:String},pincode:{type:Number},city:{type:String},state:{type:String},id:{type:String}});
const add=mongoose.model("addresses",addschema);
module.exports=add;