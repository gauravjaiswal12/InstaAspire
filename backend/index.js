const express = require('express');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const {connectToDB} = require("./config/database");
const {cloudinaryConnect} = require("./config/cloudinary");
const UserRoute = require("./routes/UserRoute");
const PostRoute = require("./routes/PostRoute");
const MessageRoute = require("./routes/MessageRoute");
const Reel = require("./routes/ReelsRoute");
const fileUpload = require('express-fileupload');
const {app,server}=require("./socket/socket");
const PORT = process.env.PORT || 8000;


dotenv.config();
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));


// CORRECT MIDDLEWARE ORDER
// 1. CORS, body-parsers, cookie-parser
 const corsOptions = {
    // origin: 'http://localhost:5174',
    origin: true,
    credentials: true,
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.status(200).json({
            message: "i am backend",
            success: true,
       }
    );
})
connectToDB();
cloudinaryConnect();

app.use('/api/v1/user',UserRoute);
app.use('/api/v1/post',PostRoute);
app.use('/api/v1/message',MessageRoute);
app.use('/api/v1/reel',Reel);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})