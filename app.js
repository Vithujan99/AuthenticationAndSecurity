//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        User.exists({email: req.body.username}, function(err, foundUser){
            if(foundUser){
                res.send("User already exists");
            }else{
                const user = new User({
                    email: req.body.username,
                    password: md5(req.body.password)
                })
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        res.render("secrets");
                    }
                });
            }
        });
    });


app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        User.findOne({email: req.body.username}, function(err, foundUser){
            if(err){
                console.log(err);
            }else{
                if(foundUser){
                    if(foundUser.password === md5(req.body.password)){
                        res.render("secrets");
                    }else{
                        res.send("Wrong Password")
                    }
                }else{
                    res.send("User not found")
                }              
            }
        })
    });

//No app.get for secrets and submit they should be only reacheble trough login adn register!!
app.listen(3000, function(){
    console.log("Server started on port 3000");
});