 const mongoose=require('mongoose');
const Users = require('./users');
 const userSchema=new mongoose.Schema({
    user_id:{
        type:String,required:true,
        ref:'Users'
    },
    token:{
        type:String,
        required:true
    }
 })
 module.exports=mongoose.model("passwords",userSchema);