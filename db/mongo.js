const mongoose = require("mongoose");
const dbConnect = () => {
  mongoose
    .connect(
      `mongodb+srv://bharath:fULXip6ljXbGJ87Y@chat-app-mern.1uidr.mongodb.net/chat-app-mern?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("DB is connected!"))
    .catch((err) => console.log(err));
};
module.exports = { dbConnect };
