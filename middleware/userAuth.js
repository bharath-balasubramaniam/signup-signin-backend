const { User } = require("../models/userModel");

let userAuth = (req, res, next) => {
  console.log(req.headers.authorization);
  const ab = req.headers.authorization;
  let token = ab.replace("x_auth=", "");
  console.log(token);
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) {
      console.log("warning");
      return res.json({
        isAuth: false,
        error: true,
        token,
      });
    }

    req.token = token;
    req.user = user;
    next();
  });
};
module.exports = { userAuth };
