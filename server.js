import express from "express";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler"
import Post from "./models/Post/Post.js";
import connectDB from "./config/mongoDB.js";
import cors from "cors";
import postRouters from "./routes/posts/postRoutes.js"

dotenv.config();
const PORT = process.env.PORT || 8000;

//!connect DB
connectDB();

const app = express();

//!Middlewares
app.use(express.json()); //gets payload from req body
const corseOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};
app.use(cors(corseOptions)); //grant requests to server from listed origins

//!Register posts routes
app.use('/', postRouters)

//! Not found handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Page does not exist!'
  })
})

//! Error Handler
app.use((err, req, res, next) => {
    const message = err.message
    res.status(500).json({
        message,
    })
})


app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running..." });
});

//! Start the server
app.listen(PORT, () => {
  console.log(`Starting server on port ${PORT}`);
});
