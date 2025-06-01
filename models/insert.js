const mongoose = require("mongoose");
const insert = new mongoose.Schema(
  {
    category: { type: String,required:true  },
    subcategory: { type: String,required:true },
    product: { type: String,required:true  },
    description: { type: String,required:true  },
    price: { type: Number,required:true },
    discountPrice: { type: String,required:true  },
    stock: { type: Number,required:true },
    stockStatus: { type: String,required:true  },
    image1: { type: [String] },
  },
  { timestamps: true }
);
const insertp = mongoose.model("products", insert);
module.exports = insertp;
