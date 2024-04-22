import express from "express";
import dotenv from "dotenv";
import Post from "./models/Post/Post.js"
import connectDB from "./config/mongoDB.js";


dotenv.config()
const PORT = process.env.PORT || 8000;

//!connect DB
connectDB();

const app = express();

//!Middlewares
app.use(express.json()) //gets payload from req body

//! Create a post
app.post('/api/v1/posts/create', async(req, res) => {
    try {
        const payload = req.body
        const createdPost = await Post.create(payload)
        res.status(200).json(createdPost)
    } catch (err) {
        res.status(400).json(err)
        console.log(err);
    }
})

//! List posts
//! Update s post
//! Get a post
//! Delete a post

app.get('/', (req, res) => {
    res.status(200).json({message: 'Server is running...'})
})


//! Start the server
app.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`);
})

