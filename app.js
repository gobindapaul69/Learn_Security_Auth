
//including dotenv:
//It loads environment variables from a .env file into process.env. 
//Storing configuration in the environment separate 
//from code is based on The Twelve-Factor App methodology.
//**It must be include at top of the code*/
require('dotenv').config()

const express = require("express");
const bodyParser = require("Body-parser");
const https = require("https");
const mongoose = require("mongoose");
const assert = require("assert");

//for security
var encrypt = require('mongoose-encryption');

const app = express();

//to include files from views folder'
app.set("view engine", "ejs");

//to include files from public folder
app.use(express.static("public"));

//for body parser or read html data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//CONNECT TO MONGODB
const dbName = "userDB";
mongoose.connect("mongodb://localhost:27017/"+dbName, 
{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on("connected", ()=>{ 
    console.log("Mongoose is connected");
});

//CREATE SCHEMA
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//ADDING SECURITY. IT SHOULD BE BEFORE CRAETE A SCHEMA MODEL
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
//userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["field1", "field2", "field3"]});//to encrypt multiple fields

//CREATE MODEL
const UserModel = mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login", {error_msg: ""});
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    UserModel.findOne({email: username}, function(err, result){
        console.log(result);
        console.log("err: "+err);
        if(!err){
            if(result){
                console.log(result.password);
                console.log(password);
                if(result.password === password){
                    console.log("Matched");
                    res.render("secrets");
                }else{
                    res.render("login", {error_msg: "Password doesn't matched"});
                }
            }
        }else{
            res.send(err);
        }
    });
});

app.get("/register", function(req, res){
    res.render("register", {msg: ""});
});

app.post("/register", function(req, res){

    const newUser = new UserModel({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(function(){
        assert(newUser.isNew == false);
        console.log("Inserted Successfully");
        res.render("secrets");
    });

    
});

app.listen(3000, function(){
    console.log("Server is up and running...");
})


