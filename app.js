const express = require('express');
const app = express();

const path = require('path');
const {islogged} = require('./middleware/authorization');
const dotenv = require('dotenv').config();
const cookieparser = require('cookie-parser');

//this is the set for read ejs file and json , url data , for use image ,video --static files
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

//these are route get from route-folder
const userroute = require('./route/user-route');
const homeroute = require('./route/home-route');
const indexroute = require('./route/index-route');


app.use(cookieparser());


const session = require("express-session");
const MongoStore = require("connect-mongo").default;


//for session use for different states and cookies 
app.use(session({
    secret:process.env.session_secret,
    resave: false,
    saveUninitialized: false,

       store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),

        cookie: {
         maxAge: 1000 * 60 * 60 * 24 * 30,// 30 day
        httpOnly: true,
        secure: false
    }

}));
/////////////////////////////


//for flash messages features
const flash = require("connect-flash");

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
/////////////////////



app.use('/',homeroute);
app.use('/userroute',userroute);
app.use('/indexroute',indexroute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});