//jshint esversion:6
require('dotenv').config();
const express = require("express");
const _ = require("lodash");
const bp = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(express.static('public'));

app.use(bp.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost:27017/SecretsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected to DataBase");
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin( encrypt, {secret: process.env.SECRET,  encryptedFeilds:  ['password'] ,excludeFromEncryption:  ["username"] } ) ;

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.route("/register").get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = new User({
      username: username,
      password: password

    });
    newUser.save(err => {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(error);
      }
    });
  });

app.route("/login").get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
      username: username
    }, (err, result) => {
      if (!err) {
        if (result) {

          if (result.password === password) {
            res.render("secrets");
          } else {
            console.log("wrong password,please try again");
          }

        } else {
          console.log("Invalid username,please try again or if you are new user please register first");
        }
      } else {
        console.log(err);
      }
    });
  });









app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
