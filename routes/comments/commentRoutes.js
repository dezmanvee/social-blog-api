import express from "express";
import commentControllers from "../../controllers/comments/commentControllers.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";

const router = express.Router();
 

//! Create a post
router.post("/create", isAuthenticated, commentControllers.createComment)


  //! Update a post
// router.put("/:categoryId", isAuthenticated, categoryControllers.updateCategory);

  //! Delete a post
// router.delete('/:categoryId', isAuthenticated, categoryControllers.deleteCategory)

export default router;