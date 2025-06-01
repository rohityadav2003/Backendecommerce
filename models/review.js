const mongoose=require("mongoose");
const usersschema=new mongoose.Schema({name:{type:String,required:true},review:{type:String,required:true},rating:{type:String,required:true}});
const Users=mongoose.model("reviews",usersschema);
module.exports=Users;