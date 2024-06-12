import express from "express";
import multer from "multer";
import postControllers from "../../controllers/posts/postControllers.js";
import storage from "../../utils/upload.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";
import checkHasSelectedPlan from "../../middlewares/hasSelectedPlan/hasSelectedPlan.js";
import authOrNot from "../../middlewares/authOrNot/authOrNot.js";
import isAccountVerified from "../../middlewares/isAccoutVerified/isAccountVerified.js";

//! Instance of multer
const fileUpload = multer({
  storage,
});

const router = express.Router();

//! Create a post
router.post(
  "/create",
  isAuthenticated,
  checkHasSelectedPlan,
  isAccountVerified,
  fileUpload.single("image"),
  postControllers.createPost
);

//! List posts
router.get("/", postControllers.listAllPosts);

//! Update a post
router.put("/:postId", isAuthenticated, postControllers.updatePost);

//! Get a post
router.get("/:postId", authOrNot, postControllers.getSinglePost);

//! Delete a post
router.delete("/:postId", isAuthenticated, postControllers.deletePost);

//! Like a post
router.put("/like/:postId", isAuthenticated, postControllers.like);

//! Dislike a post
router.put("/dislike/:postId", isAuthenticated, postControllers.dislike);

export default router;
