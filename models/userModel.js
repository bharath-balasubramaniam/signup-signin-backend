const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 7;
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 5,
  },
  role: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
  randomstr: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});
//encoding the password before saving to db
userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});
// compare the encoded password with actual one
userSchema.methods.comparePassword = function (plainPassword, cb) {
  var user = this;
  console.log(plainPassword, user.password);
  bcrypt.compare(plainPassword, user.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
  //   const isMatch = bcrypt.compareSync(plainPassword, user.password);
  //   console.log(isMatch);
};

//generate token
userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "secret");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};
userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, "secret", function (err, decode) {
    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
const User = mongoose.model("User", userSchema);
module.exports = { User };
