const mongoose = require("mongoose");
const order = new mongoose.Schema({
  username: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  productname: { type: [String] },
   totalamounts: { type: Number },
  totalitem1: { type: String },
  status: { type: String, default: "place order" },useremail:{type:String},shippedAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});
const orderdeta = mongoose.model("orderdetails", order);
module.exports = orderdeta;
