const mongoose = require('mongoose');
 require("dotenv").config();

 exports.connectToDB = () => {
     mongoose.connect(process.env.MONGO_URI)
     .then(() => {
         console.log("Connected to DB");
     })
     .catch((err) => {
         console.log("Could not connect to DB");
         console.log(err);
         process.exit(1);
     })
 }