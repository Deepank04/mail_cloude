const express = require('express');
const router = express.Router();
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const route = express.Router();
const usermodel = require('../model/user');

router.use(cookieparser());

module.exports.register = async (req,res)=>{
  try{
      let already = await usermodel.findOne({email:req.body.email});
      if(already){
        res.send("this user is already exists : please try another mail");
      }


      let user = await usermodel.create({
        firstname,
        surname,
        dob,
        gender,
        email,
        password
      })

      res.send(user);
  }
  catch{
        res.send("something went wrong");
  }
}


module.exports.login = async (req,res)=>{
  try{
    let user = await usermodel.findOne({email:req.body.email});
    if(!user){
      return res.send("invalid user");
    }

    cookieparser("token", token);
    bcrypt.compare(req.body.password,user.password,(err,result)=>{
      if(err){
        return res.send("something went wrong");
      }
      if(!result){
        return res.send("invalid password");
      }
  });

    res.send("login successfully");

  }
  catch(err){

  }
}



