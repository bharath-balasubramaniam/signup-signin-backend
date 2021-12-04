const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 7;
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { dbConnect } = require("./db/mongo");
const { sendEmail } = require("./mailer/mail");
const { randomStr } = require("./mailer/mail_template");
const app = express();
//schema
const { User } = require("./models/userModel");
//port
const port = process.env.PORT || 9000;
//parse your request body into a json format
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//for cookie
app.use(cookieParser());
//connect to database
dbConnect();
// Middleware
const { userAuth } = require("./middleware/userAuth");
//service
app.use(cors());
//for checking thedeployment
app.get("/", (req, res) => {
  res.status(200).send("Hello Web developer");
});
//All routes
app.post("/user/register", (req, res) => {
  const user = new User(req.body);
  user.save((err) => {
    if (err) {
      return res.json({ success: false, err });
    } else {
      return res.status(200).json({ success: true });
    }
  });
});
app.post("/user/login", (req, res) => {
  //find the email
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "Auth failed email not found",
      });
    }
    //compare password
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        // console.log(isMatch);
        return res.json({
          loginSuccess: false,
          message: "Wrong password",
        });
      }
    });
    //generate token
    user.generateToken((err, data) => {
      // console.log({ ab: data });
      if (err) return res.status(400).send(err);
      res.cookie("x_auth", data.token);
      res.status(200).json({ loginSuccess: true, token: data.token });
      // res.cookie("x_auth",data.token).send()
    });
  });
});
app.post("/user/forgotPassword", (req, res) => {
  User.findOneAndUpdate(
    { email: req.body.email },
    { $set: { randomstr: randomStr } },
    (err, user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "Auth failed email not found",
        });
      } else {
        sendEmail(req.body.email, req.body.name, "hello");
        return res.json({
          success: true,
          message: "Password reset link is sent to this email",
        });
      }
    }
  );
});
app.post("/user/resetPassword/:str", (req, res) => {
  res.clearCookie("x_auth");
  req.token = "";
  User.findOne({ randomstr: req.params.str }, (err, user) => {
    ///////////////////////////////////////////////////////////////////////////////////////////
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      // console.log(hash);
      // console.log(hash);
      User.findOneAndUpdate(
        { randomstr: req.params.str },
        { $set: { password: hash, randomstr: "", token: "" } },
        (err, data) => {
          if (data) {
            res.status(200).json({
              success: true,
              message: "Password Updated!",
            });
          }
        }
      );
    });
  });
});

// res.status(200).json({
//   message: "Password Updated!",
// });
// if (!user) {
//   return res.json({ message: "password not updated!" });
// }
// if (err) res.sendStatus(500);

app.get("/user/auth", userAuth, (req, res) => {
  return res.status(200).json({ login: true });
});
app.get("/user/logout", userAuth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});
//
app.listen(port);
