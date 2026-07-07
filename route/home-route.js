const express = require('express');
const route = express.Router();


route.get("/",(req,res)=>{

  res.render("test");
})

route.get('/login',(req,res)=>{
  res.render("login/home");
});


module.exports = route;



