import express from "express";
import multer from "multer";
import postControllers from "../../controllers/posts/postControllers.js";
import storage from "../../utils/upload.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";

//! Instance of multer
const fileUpload = multer({
  storage
})
 
const router = express.Router();
 

//! Create a post
router.post("/create", isAuthenticated, fileUpload.single('image'), postControllers.createPost)


  //! List posts
router.get("/", postControllers.listAllPosts);

  //! Update a post
router.put("/:postId", isAuthenticated, postControllers.updatePost);

  //! Get a post
router.get('/:postId', postControllers.getSinglePost)


  //! Delete a post
router.delete('/:postId', isAuthenticated, postControllers.deletePost)

export default router;