import express from "express";
import dotenv from "dotenv";
import Post from "./models/Post/Post.js";
import connectDB from "./config/mongoDB.js";
import cors from "cors";

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

//! Create a post
app.post("/api/v1/posts/create", async (req, res) => {
  try {
    const postData = req.body;
    const createdPost = await Post.create(postData);
    res.json({
      status: "success",
      message: "Post created successfully",
      createdPost,
    });
  } catch (err) {
    throw new Error(err);
  }
});

//! List posts
app.get("/api/v1/posts", async (req, res) => {
  const allPosts = await Post.find();
  try {
    res.json({
      status: "success",
      message: "Posts fetched successfully",
      allPosts,
    });
  } catch (error) {
    throw new Error(error);
  }  
});
//! Update a post
app.put("/api/v1/posts/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const postFound = await Post.findById(postId);

    if (!postFound) {
        throw new Error ('post not found')
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title: req.body.title, description: req.body.description },
      { new: true }
    );
    res.json({
        status: 'success',
        message: 'Post updated successfully',
        updatedPost
    })
  } catch (error) {
    throw new Error (error)
  }
});
//! Get a post
app.get('/api/v1/posts/:postId', async(req, res) => {
    try {
        const postId = req.params.postId

        const post = await Post.findById(postId)
        res.json({
            status: 'success',
            post
        })
    } catch (error) {
        throw new Error (error)
    }
})
//! Delete a post
app.delete('/api/v1/posts/:postId', async(req, res) => {
    try {
        const postId = req.params.postId

        await Post.findByIdAndDelete(postId)
        res.json({
            status: 'success',
            message: 'Post deleted successfully'
        })
    } catch (error) {
        throw new Error (error)
    }
})


app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running..." });
});

//! Start the server
app.listen(PORT, () => {
  console.log(`Starting server on port ${PORT}`);
});
