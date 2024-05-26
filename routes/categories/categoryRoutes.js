import express from "express";
import multer from "multer";
import categoryControllers from "../../controllers/categories/categoryControllers.js";
import storage from "../../utils/upload.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";

const router = express.Router();
 

//! Create a post
router.post("/create", isAuthenticated, categoryControllers.createCategory)


  //! List posts
router.get("/", categoryControllers.listAllCategories);

  //! Update a post
router.put("/:categoryId", isAuthenticated, categoryControllers.updateCategory);

  //! Get a post
router.get('/:categoryId', categoryControllers.getSingleCategory)


  //! Delete a post
router.delete('/:categoryId', isAuthenticated, categoryControllers.deleteCategory)

export default router;