import { Comment } from "../../models/Comment/Comment.js";
import Post from "../../models/Post/Post.js";
import asyncHandler from "express-async-handler";

const commentControllers = {
  //! Create a comment
  createComment: asyncHandler(async (req, res) => {
    // Find the post ID and the comment's content
    const {postId, content} = req.body;
    // Find the post from model
    const postExist = await Post.findById(postId)

    if (!postExist) {
      throw new Error('Post not found')
    }
    // Create the comment
    const commentCreated = await Comment.create({
      content,
      author: req.user,
      post: postId
    })
    // Push comment to the post
    postExist.comments.push(commentCreated?._id)
    // Save the post
    await postExist.save()
    // Send response to the client
    res.json({
      status: "success",
      message: "Comment created successfully",
      commentCreated,
    });
  }),

  //! Update a comment
  updateComment: asyncHandler(async (req, res) => {}),
  //! Delete a comment
  deleteComment: asyncHandler(async (req, res) => {}),
};

export default commentControllers;
