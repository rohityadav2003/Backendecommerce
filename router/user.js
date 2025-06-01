require("dotenv").config();

const express = require("express");
const app = express();

const path = require("path");
const { verifyToken, generateToken } = require("../validation/token");
const Users = require("../models/users");
const add = require("../models/address");
const cart = require("../models/cart");
const orders = require("../models/orderdetail");

const bcrypt = require("bcrypt");
const router = express.Router();
const { validationResult } = require("express-validator");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
//middleware//
// app.use(session({
//     secret:'my secret key',
//     resave:false,
//     saveUninitialized:true,
//     cookie:{secure:false}

// }))
// app.use(express.static("public"));
// router.use(bodyparser.urlencoded({extended:true}));
const mailer = require("../validation/mailer");
//PAYMENT RAZORPAY//

const {
  registervalidator,
  sendmailvarification,
} = require("../validation/validation");
router.post("/signup", registervalidator, async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const exist = await Users.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 1 * 60 * 1000);
    const user = new Users({
      name,
      email,
      mobile,
      otpExpires,
      password: hashedPassword,
      otp,
    });
    await user.save();

    const msg = `<p>Hi ${name}, your OTP is <b>${otp}</b></p>`;
    mailer.sendMail(email, "OTP Verification", msg);

    res
      .status(200)
      .json({ message: "Registered successfully. Check your email for OTP." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new OTP." });
    }
    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      res.status(200).json({ message: "Email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// resendotp//
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpiry = new Date(Date.now() + 1 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpires = newOtpExpiry;
    await user.save();

    const msg = `<p>Your new OTP is <b>${newOtp}</b>. It will expire in 1 minutes.</p>`;
    mailer.sendMail(email, "Resend OTP", msg);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// LOGIN WITH JWT TOKEN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.status(404).json({ message: "No record found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });
    req.session.userEmail = { email: user.email, name: user.name };

    //  const token = generateToken({ id: user._id, email: user.email, name: user.name });
    res.status(200).json({
      message: "Login successful",
      // token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
//forgotPasswordd//

router.post("/forgotPassword", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// carts//
router.post("/cart", async (req, res) => {
  const id = req.session.userEmail.email;

  const { product, price, discountPrice, stockStatus, image1 } = req.body;

  try {
    const savedata = new cart({
      product,
      price,
      discountPrice,
      stockStatus,
      image1,
      id,
    });
    await savedata.save();
    return res.status(200).json({ message: "cart successfull" });
  } catch (err) {
    console.log(err.message);
  }
});
//apicarts//
router.get("/apicarts", async (req, res) => {
  const id = req.session.userEmail.email;
  const carts = await cart.find({ id });
  res.json(carts);
});
router.get("/fetchlogin", (req, res) => {
  if (!req.session.userEmail) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { name, email } = req.session.userEmail;
  res.status(200).json({ name, email });
});

router.post("/deletecart", async (req, res) => {
  try {
    const { id } = req.body;
    await cart.findByIdAndDelete(id);
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting cart item", error: err.message });
  }
});
//address//
router.post("/address", async (req, res) => {
  const { username, address, city, pincode, state } = req.body;
  const id = req.session.userEmail.email;
  try {
    if (!id) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const saveadd = new add({
      username,
      address,
      city,
      pincode,
      state,
      id,
    });
    await saveadd.save();
    res.status(200).json({ message: "address edit successfully" });
  } catch (err) {
    console.log(err.message);
  }
});
//logout//
router.get("/logoutapi", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.json({ mesaage: "cannot logout" });
    }
    res.json({ message: "logout succesfull" });
  });
});
router.get("/payment", async (req, res) => {
  try {
    if (!req.session.userEmail || !req.session.userEmail.email) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const id = req.session.userEmail?.email;
    const payment = await add.find({ id });
    res.status(200).json(payment);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});
//paymentrazorpay//
router.post("/create-order", async (req, res) => {
  const { totalamounts } = req.body;

  const options = {
    amount: totalamounts * 100, // amount in paisa
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});
//myorders//
// routes/admin.js or similar

module.exports = router;
