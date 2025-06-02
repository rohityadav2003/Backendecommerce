require('dotenv').config();
const express=require("express");
const app=express();
const session=require("express-session");
const mongoose=require("mongoose");
const path=require("path");
const cors=require("cors");
const  bodyParser=require("body-parser");
const router=require('./router/admin');
const router1=require('./router/user');
const authRoute=require('./router/authRoute');

//middleware//
app.use(express.static('public'));

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

// app.use(cors({
//     origin:'http://localhost:3000',
//     credentials:true
// }));
app.use(cors());
// app.use(cors());
app.set("trust proxy", 1);
app.use(
  session({
    secret: "my secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  })
);
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));
// mongoose.connect(process.env.MONGODB_URL)
// .then(()=>console.log("mongodb connected"))
// .catch(()=>console.log("error occured"));
app.get('/',function(req,res){
    res.render('index');

})
// app.use((req,res,next)=>{
//     const userEmail=req.session.userEmail;
//     console.log({userEmail,session:req.session});
//     next();
// });
app.use('/admin',router);
app.use('/user',router1);
app.use('/',authRoute);
app.use("/api/footer", require("./router/footerRoutes"));

app.listen(process.env.PORT,()=>{
    console.log("server running");
})


