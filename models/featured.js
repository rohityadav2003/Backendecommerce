const mongoose = require("mongoose");
const insert1 = new mongoose.Schema(
  {
   
    featured: { type: [String] },    featured: { type: [String] },product: { type: String,required:true  },
   
    price: { type: Number,required:true },
  
  
    stockStatus: { type: String,required:true  },
  },
  { timestamps: true }
);
const coll = mongoose.model("collections", insert1);
module.exports = coll;
