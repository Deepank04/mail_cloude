const express = require('express');
const route = express.Router();
const {register,login}=require('../controller/authentication');
const usermodel = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const mailmodel = require('../model/mail');



route.use(cookieparser());






route.get('/name',(req,res)=>{
  res.render("createAccount/name");
});

route.post("/name", (req, res) => {
 
   req.session.signup = {
    firstname: req.body.firstname,
    surname:req.body.surname,
    dob:"",
    gender:"",
    email:"",
    password:""
   };

    res.redirect("/userroute/dob");
});

route.get('/dob',(req,res)=>{
  res.render("createAccount/dob");
})


route.post("/dob", (req, res) => {

   

    const { day, month, year, gender } = req.body;

    
    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    req.session.signup.dob = dob;
    req.session.signup.gender = gender;

    res.redirect("/userroute/email");
});


route.get('/email',(req,res)=>{
  res.render("createAccount/email");
});

route.post("/email", async (req, res) => {
 
      if (!req.session.signup) {
        req.session.signup = {};
    }

    let user = await usermodel.findOne({ email: req.body.email });
    if(user){
      return res.send("email already exists");
    }
    const token = jwt.sign({email:req.body.email},process.env.jwt_secret,{expiresIn:'1h'});

    res.cookie("token", token, {
    httpOnly: true,
    secure: false
});
    req.session.signup.email = req.body.email;

    res.redirect("/userroute/password");
});

route.get('/password',(req,res)=>{
  res.render("createAccount/password");
})

route.post("/password",async (req, res) => {

  try{
    req.session.signup.password = req.body.password;

    const data = req.session.signup;

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(data.password,salt);


  let user = await usermodel.create({
  firstname:data.firstname,
  surname:data.surname,
  dob:data.dob,
  gender:data.gender,
  email:data.email,
  password:hash,
  })

await new Promise(resolve => setTimeout(resolve, 2000));

req.session.flash = {
    type: "success",
    message: "Register Successfully"
};



req.session.save(err => {
    if (err) return res.send("Session error");
    res.redirect("/indexroute/index");
});

}
catch(err){
  console.log(err);
}
  
});




route.post('/logemail',async (req,res)=>{
  
  try{
    let user = await usermodel.findOne({email:req.body.email});
    if(!user){
      req.flash("error","Inavlid Email");
      return res.redirect("/login");
    }

    const token = jwt.sign({email:req.body.email},process.env.jwt_secret,{expiresIn:'1h'});
    res.cookie("token", token, {
    httpOnly: true,
    secure: false
});

 req.session.user = user;
 req.flash("success","Email Match")
res.redirect("/userroute/logpassword");
}
  catch(err){
      return res.send("server error");
  }

});



route.get('/logpassword',(req,res)=>{
  let user = req.session.user;
  if(!user){
   req.flash("error","invalid credentials login again");
   res.redirect("/");
  }
  res.render("login/logpassword",{user:user});

});

route.post('/logpassword',async (req,res)=>{ 

  try{
    let user = req.session.user;
    if(!user){
      req.flash("error","something went wrong")
      return res.redirect("/userroute/logpassword");
    }

    const token = jwt.sign({email:req.body.email},process.env.jwt_secret,{expiresIn:'5h'});
    res.cookie("token", token, {
    httpOnly: true,
    secure: false
});
bcrypt.compare(req.body.password, user.password, async (err, result) => {

    if (err) {
         req.flash("error","Something went wrong");
         return res.redirect("/userroute/logpassword");
    }

    if (!result) {
         req.flash("error","Invalid password");
         return res.redirect("/userroute/logpassword");
    }

    req.session.userid = user._id;
  
req.flash("success", "Login Successfully");
res.redirect("/indexroute/index");

        });

      }
  catch(err){
      return res.send("server error");
  }
});



route.get('/logout', (req, res) => {
    req.session.userid = null;
    req.session.user = null;   // if you use this

    res.clearCookie("token");

    req.flash("success", "Logout Successfully");
    res.redirect("/login");
});

const { islogged } = require('../middleware/authorization');

const upload = require("../config/multer");

route.post(
    "/image/update/:id",
    upload.single("profile"),
    async (req, res) => {

        const base64 = req.file.buffer.toString("base64");

        await usermodel.findByIdAndUpdate(req.params.id, {
            image: base64,
            imageType: req.file.mimetype
        });

        res.redirect(`/indexroute/profileupdate/${req.params.id}`);
    }
);

route.post('/delete/:id',async (req,res)=>{

  if(!mail){
    req.flash("please choose valid mail");
    return;
  }
  if(!user){
    req.flash("something went wrong");
    return;
  }
    let mail = await mailmodel.findById(req.params.id);
    let user = await usermodel.findById(req.session.userid);

    mail.trash=true;

    user.inbox.pull(req.params.id);
    await user.save();
    await mail.save();

    res.redirect("/indexroute/index");
    
});


route.get("/deleted/:id", islogged, async (req, res) => {
    try {

        await mailmodel.findByIdAndDelete(req.params.id);

        req.flash("success","Deleted successfully");

        res.redirect("/indexroute/sends");

    } catch (err) {

        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/indexroute/sends");

    }
});





module.exports = route;

