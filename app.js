//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});
//Encryption for collections User
// Add any other plugins or middleware here. For example, middleware for hashing passwords
const secret = "ThisisourlittleSecret.";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods

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
                    password: req.body.password
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
                    if(foundUser.password === req.body.password){
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

app.listen(3000, function(){
    console.log("Server started on port 3000");
});