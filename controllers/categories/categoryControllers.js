import {Category} from "../../models/Category/Category.js";
import asyncHandler from "express-async-handler";

const categoryControllers = {
  //! Create a category
  createCategory: asyncHandler(async (req, res) => {
    const { categoryName } = req.body;

    //check if category exits
    const categoryExits = await Category.findOne({ categoryName });

    if (categoryExits) {
      throw new Error("Category already exists");
    }

    const categoryCreated = await Category.create({categoryName});

    res.json({
      status: "success",
      message: "Category created successfully",
      categoryCreated,
    });
  }),

  //! List categories
  listAllCategories: asyncHandler(async (req, res) => {
    const allCategories = await Category.find();
    res.json({
      status: "success",
      message: "Categories fetched successfully",
      allCategories,
    });
  }),
  //! Update a category
  updateCategory: asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;
    
    //find category in model
    const categoryFound = await Category.findById(categoryId);

    if (!categoryFound) {
      throw new Error("category not found");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        categoryName: req.body.categoryName,
        description: req.body.description,
      },
      { new: true }
    );
    res.json({
      status: "success",
      message: "Category updated successfully",
      updatedCategory,
    });
  }),
  //! Get a category
  getSingleCategory: asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;

    const category = await Category.findById(categoryId);
    res.json({
      status: "success",
      category,
    });
  }),
  //! Delete a category
  deleteCategory: asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;

    await Category.findByIdAndDelete(categoryId);
    res.json({
      status: "success",
      message: "Category deleted successfully",
    });
  }),
};

export default categoryControllers;  
