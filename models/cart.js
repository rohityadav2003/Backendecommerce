const mongoose=require('mongoose');
const cartschema=new mongoose.Schema({product:{type:String,},price:{type:String},discountPrice:{type:String},stockStatus:{type:String},image1:{type:String},id:{type:String}})
    const cart = mongoose.model("carts", cartschema);
    module.exports = cart;