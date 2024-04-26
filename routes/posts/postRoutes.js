import express from "express";
import postControllers from "../../controllers/posts/postControllers";

const router = express.Router();

//! Create a post
router.post("/api/v1/posts/create", postControllers.createPost)


  //! List posts
router.get("/api/v1/posts", postControllers.listAllPosts);

  //! Update a post
router.put("/api/v1/posts/:postId", postControllers.updatePost);

  //! Get a post
router.get('/api/v1/posts/:postId', postControllers.getSinglePost)


  //! Delete a post
router.delete('/api/v1/posts/:postId', postControllers.deletePost)

  export default router