const express = require("express");
const app = express();
const session = require("express-session");
const router = express.Router();
const bodyparser = require("body-parser");
const admin = require("../models/admindetails");
const create = require("../models/category");
const sub = require("../models/sub-category");
const addproduct = require("../models/insert");
const coll = require("../models/collection");
const Review = require("../models/review");
const Users=require('../models/users');
const multer = require("multer");
const path = require("path");
const orders = require("../models/orderdetail");
// router.use(bodyparser.urlencoded({extended:true}));
// app.use(express.static("public"));
// app.use(session({
//     secret:"my secret-key",
//     resave:false,
//     saveUninitialized:true,
//     cookie:{secure:false}
// }))
router.get("/adminlogin", async (req, res) => {
  res.render("adminlogin");
});
//adminlogin//
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const exist = await admin.findOne({ email });
    if (!exist) {
      return res.send('<script>alert("no record found")</script>');
    } else if (exist.password === password) {
      req.session.adminemail = { email: exist.email, name: exist.name };
      res.redirect(`/admin/dashboard`);
    } else {
      return res.send("incorrect password");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/dashboard", async (req, res) => {
  if (!req.session.adminemail) {
    res.render("adminlogin");
  } else {
    const totalOrders = await orders.countDocuments();
  const totalUsers = await Users.countDocuments();
  const totalProducts = await addproduct.countDocuments();
   const totalRevenueResult = await orders.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$totalamounts" } }
        }
      }
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

     const monthlyRevenue = await orders.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: { $toDouble: "$totalamounts" } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ✅ Top 5 Best-Selling Products
    // ✅ Top 5 Best-Selling Products by quantity sold
const topProducts = await orders.aggregate([
  { $unwind: "$productname" },
  {
    $group: {
      _id: "$productname",
      totalUnitsSold: {
        $sum: {
          $toInt: "$totalitem1"
        }
      }
    }
  },
  { $sort: { totalUnitsSold: -1 } },
  { $limit: 5 }
]);



    // ✅ Order Status Counts
    const statusCounts = await orders.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const { email, name } = req.session.adminemail;

    res.render("admindash", {
      email,
      name,
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
      }),
      monthlyRevenue,
      topProducts,
      statusCounts
    });
  }
});

//multer//
const mystorage = multer.diskStorage({
  destination: "./public/uploads",
  // destination: (req, file, cb) => {
  //     cb(null, path.join(__dirname, "../public/uploads")); // Ensures images are saved inside backend/public/uploads
  // },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: mystorage,
  limits: {
    filesize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const filetype = /jpg|jpeg|webp|png/;
    const extname = filetype.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetype.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("files format not supported"));
    }
  },
});

//create category//
router.get("/category", async (req, res) => {
  const { email, name } = req.session.adminemail;
  return res.render("category", { success: null, email, name });
});
router.post("/create-cate", upload.array("image",10), async (req, res) => {
  const { category, description } = req.body;
  // const imagepath = `/uploads/${req.file.filename}`;for single image 
  const imagepath = req.files.map((file) => `/uploads/${file.filename}`);//multiple image

  try {
    const savecate = new create({
      category,
      description,
      image: imagepath,
    });
    await savecate.save();
    const { email, name } = req.session.adminemail;

    return res.render("category", {
      success: "create category successfull",
      email,
      name,
    });
  } catch (err) {
    console.log(err.message);
  }
});
//manage category table//
router.get("/manage-category", async (req, res) => {
  const manage = await create.find();
  const { email, name } = req.session.adminemail; //only for navbar//
  res.render("manage-category", { manage, email, name });
});
//api//
router.get("/apimanage-category", async (req, res) => {
  const manage = await create.find();
  // const {email,name}=req.session.adminemail;//only for navbar//
  res.json({ manage });
});
//delete category//
router.get("/delete/:id", async (req, res) => {
  await create.findByIdAndDelete(req.params.id);
  res.redirect(`/admin/manage-category`);
});
//edit category//
router.get("/category-edit/:id", async (req, res) => {
  const editcate = await create.findById(req.params.id);
  const { email, name } = req.session.adminemail; //only for navbar//
  res.render("category-edit", { editcate, email, name });
});
router.post("/cate-edit/:id", async (req, res) => {
  const { category, description } = req.body;
  await create.findByIdAndUpdate(req.params.id, { category, description });

  res.redirect(`/admin/manage-category`);
});
// editimage//
router.get("/editimg/:id", async (req, res) => {
  const editimg = await create.findByIdAndUpdate(req.params.id);
  res.render("editimagecate", { editimg });
});
router.post("/updateimg/:id", upload.array("image",10), async (req, res) => {
  try {
     const imagepath = req.files.map((file) => `/uploads/${file.filename}`);
    await create.findByIdAndUpdate(req.params.id, {
      image: imagepath,
    });
    res.redirect("/admin/manage-category");
  } catch (err) {
    console.log(err.message);
  }
});

//sub-category//
router.get("/sub", async (req, res) => {
  const manage = await create.find();
  res.render("sub-category", { manage });
});
router.post("/add-subcategory", async (req, res) => {
  const { category, subcategory } = req.body;
  const save1 = new sub({
    category,
    subcategory,
  });
  await save1.save();
  res.redirect(`/admin/sub`);
});
router.get("/manage-sub", async (req, res) => {
  const managesub = await sub.find();
  res.render("manage-sub", { managesub });
});
//api
router.get("/apimanage-sub", async (req, res) => {
  const managesub = await sub.find();
  res.json({ managesub });
});

router.get("/sub-delete/:id", async (req, res) => {
  await sub.findByIdAndDelete(req.params.id);
  res.redirect("/admin/manage-sub");
});
router.get("/subcategory-edit/:id", async (req, res) => {
  const submanage = await sub.findById(req.params.id);
  res.render("sub-edit", { submanage });
});
router.post("/sub-edit/:id", async (req, res) => {
  const { category, subcategory } = req.body;
  await sub.findByIdAndUpdate(req.params.id, { category, subcategory });
  res.redirect(`/admin/manage-sub`);
});
//insert product//
router.get("/insert", async (req, res) => {
  const insert = await create.find();
  const insert1 = await sub.find();
  res.render("insertproduct", { insert, insert1 });
});
router.post("/add-product", upload.array("image1", 10), async (req, res) => {
  const {
    category,
    subcategory,
    product,
    description,
    price,
    discountPrice,
    stock,
    stockStatus,
  } = req.body;
  const imagepaths = req.files.map((file) => `/uploads/${file.filename}`);
  try {
    const product1 = new addproduct({
      category,
      subcategory,
      product,
      description,
      price,
      discountPrice,
      stock,
      stockStatus,
      image1: imagepaths,
    });

    await product1.save();

    res.redirect("/admin/insert");
  } catch (err) {
    console.log(err.message);
  }
});

//new collection//
router.post("/collproduct", upload.array("image2", 10), async (req, res) => {
  const { product, price, stockStatus, discountPrice, description } = req.body;
  const imagepath = req.files.map((file) => `/uploads/${file.filename}`);
  try {
    const product2 = new coll({
      image1: imagepath,
      product,
      price,
      stockStatus,
      discountPrice,
      description,
    });

    await product2.save();

    res.redirect("/admin/insert");
  } catch (err) {
    console.log(err.message);
  }
});
//collection//
router.get("/apicollection", async (req, res) => {
  const data1 = await coll.find();

  res.json({ data1 });
});
// product insert manage//
router.get("/manage-product", async (req, res) => {
  const product = await addproduct.find();
  res.render("insertmanage", { product });
});
//api product//
router.get("/apiproduct", async (req, res) => {
  const product = await addproduct.find();
  res.json({ product });
});
//product edit//
router.get("/insertmange-edit/:id", async (req, res) => {
  const editp = await addproduct.findById(req.params.id);
  res.render("insert-edit", { editp });
});
router.post("/editproduct/:id", async (req, res) => {
  const { product, category, subcategory, discountPrice, description, price } =
    req.body;
  await addproduct.findByIdAndUpdate(req.params.id, {
    product,
    category,
    subcategory,
    discountPrice,
    description,
    price,
  });
  res.redirect("/admin/manage-product");
});
//delete product//
router.get("/insert-delete/:id", async (req, res) => {
  await addproduct.findByIdAndDelete(req.params.id);
  res.redirect(`/admin/manage-product`);
});
//insertimage//
router.get("/editinsertimg/:id/:index", async (req, res) => {
  const { id, index } = req.params;
  const product = await addproduct.findById(id);

  const oneImage = product.image1[index];

  res.render("editinsertimage", { oneImage, id, index });
});
//insertimageedit//
router.post(
  "/editimagesin/:id/:index",
  upload.single("image"),
  async (req, res) => {
    const { id, index } = req.params;
    const product = await addproduct.findById(id);
    const newimage = `/uploads/${req.file.filename}`;
    product.image1[index] = newimage;
    await product.save();
    res.redirect("/admin/insertmange-edit");
  }
);

//review//
router.post("/review", async (req, res) => {
  const { name, review, rating } = req.body;
  try {
    const savedata = new Review({
      name,
      review,
      rating,
    });
    await savedata.save();
    return res.status(200).json({ message: "review successfully" });
  } catch (err) {
    console.log(err.message);
  }
});
//api review//
router.get("/apireviews", async (req, res) => {
  const reviews = await Review.find();

  res.json({ reviews });
});
//orderdetails//
router.post("/order-detail", async (req, res) => {
  const useremail=req.session.userEmail.email;
  const {
    username,
    address,
    city,
    state,
    pincode,
    productname,
    totalamounts,
    totalitem1,
    status
    
  } = req.body;
  try {
    console.log(req.body);

    const savedata = new orders({
      username,
      address,
      city,
      state,
      pincode,
      productname,
      totalamounts,
      totalitem1,
      status,useremail
    });
    const data = await savedata.save();
    res.status(200).json({ message: "order successfully placed" });
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/detailp", async (req, res) => {
  const detailsp = await orders.find();
  res.render("detailp", { orders: detailsp });
});
//statusorders//
router.post("/status-orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orders.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const currentStatus = order.status.toLowerCase();
    const newStatus = status.toLowerCase();

    // Block any update if the order is already cancelled
    if (currentStatus === "cancelled") {
      return res.status(400).send("Cannot update status. Order is already cancelled.");
    }

    const validTransitions = {
      "place order": ["shipped", "cancelled"],
      "shipped": ["delivered"],
      "delivered": [],
      "cancelled": []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).send(`Invalid status transition from "${currentStatus}" to "${newStatus}"`);
    }

    const updatedFields = { status: newStatus };

    if (newStatus === "delivered") {
      updatedFields.deliveredAt = new Date();
    }
    if (newStatus === "shipped") {
      updatedFields.shippedAt = new Date();
    }

    await orders.findByIdAndUpdate(req.params.id, updatedFields);
    res.redirect("/admin/detailp");

  } catch (err) {
    console.log("Update Error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/myorders',async(req,res)=>{
    const useremail= req.session.userEmail?.email;
    const myorder=await orders.find({useremail});
    res.json(myorder)
  })
 router.put("/cancelorder/:id", async (req, res) => {
  try {
    const order = await orders.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    switch (order.status) {
      case "delivered":
        return res.status(400).json({ message: "Order delivered. You can request a return." });

      case "shipped":
        return res.status(400).json({ message: "Order already shipped. You can return after delivery." });

      case "cancelled":
        return res.status(400).json({ message: "Order already cancelled" });

      case "place order":
        order.status = "cancelled";
        await order.save();
        return res.status(200).json({ message: "Order cancelled successfully" });

      default:
        return res.status(400).json({ message: "Invalid order status" });
    }

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



module.exports = router;
