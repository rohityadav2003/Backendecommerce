const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema({
  aboutLinks: [
    {
      title: String,
      url: String,
    },
  ],
  categories: [
    {
      title: String,
      url: String,
    },
  ],
  contact: {
    address: String,
    phone: String,
    email: String,
  },
  registeredOffice: {
    address: String,
    phone: String,
  },
  socialIcons: [String],        // Example: ["fa-brands fa-facebook", ...]
  paymentLogos: [String],       // URLs for images
}, { timestamps: true });

module.exports = mongoose.model("Footer", footerSchema);
