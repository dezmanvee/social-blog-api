import { Category } from "../../models/Category/Category.js";
import Post from "../../models/Post/Post.js"
import asyncHandler from "express-async-handler"


const postControllers = {

    //! Create a post
    createPost: asyncHandler(async (req, res) => {
        const {description, category} = req.body;
        
        // Check if category exits in DB
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
          throw new Error('Category is not available.')
        }

        const createdPost = await Post.create({description, category, image: req.file, author: req.user});
        res.json({
          status: "success",
          message: "Post created successfully",
          createdPost,
        });
        
        //push post into category
        categoryExists.posts.push(categoryExists?._id)
        
        //Resave the category
        await categoryExists.save()
      }),
      //! List posts
      listAllPosts: asyncHandler(async (req, res) => {
        
        const {title, category, page=1, limit=9} = req.query

        //Set basic filtering
        let filter = {}
        if (category) {
          filter.category = category
        }

        if (title) {
          filter.description = title
        }
        //Total posts based on filtering
        // const totalPostsByFilter = 
        const allPosts = await Post.find(filter).populate('category').sort({createdAt: -1})
          res.json({
            status: "success",
            message: "Posts fetched successfully",
            allPosts,
          });
      }),
      //! Update a post
      updatePost: asyncHandler(async (req, res) => {

        const postId = req.params.postId;
        
        const postFound = await Post.findById(postId);
      
        if (!postFound) {
            throw new Error ('Post not found')
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
      }),
      //! Get a post
      getSinglePost: asyncHandler(async(req, res) => {
        const postId = req.params.postId
      
        const post = await Post.findById(postId)
        res.json({
            status: 'success',
            post
        })
      }),
      //! Delete a post
      deletePost: asyncHandler(async(req, res) => {
        const postId = req.params.postId
      
        await Post.findByIdAndDelete(postId)
        res.json({
            status: 'success',
            message: 'Post deleted successfully'
        })
      
      }),
}

export default postControllers