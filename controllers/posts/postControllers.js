
const postControllers = {

    //! Create a post
    createPost: asyncHandler(async (req, res) => {
        const {title, description} = req.body;
      
        //check if post exists
        const postFound = await Post.findOne({title})
        if (postFound) {
            throw new Error('Post already exists')
        }
      
        const createdPost = await Post.create({title, description});
        res.json({
          status: "success",
          message: "Post created successfully",
          createdPost,
        });
      }),

      //! List posts
      listAllPosts: asyncHandler(async (req, res) => {
        const allPosts = await Post.find();
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