const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");



function islogged(req, res, next) {

    try {

        // Prevent browser from caching protected pages
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");

        const token = req.cookies.token;

        if (!token) {
            req.flash("error", "Please login first");
            return res.redirect("/");
        }

        const data = jwt.verify(token, process.env.jwt_secret);

        req.user = data;

        next();

    } catch (err) {

        req.flash("error", "Please login first");
        return res.redirect("/");

    }
}

module.exports = { islogged };