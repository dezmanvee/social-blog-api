import { Category } from "../../models/Category/Category.js";
import Post from "../../models/Post/Post.js";
import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";
import { Notification } from "../../models/Notification/Notification.js";
import { sendNotification } from "../../utils/nodemailer.js";

const postControllers = {
  //! Create a post
  createPost: asyncHandler(async (req, res) => {
    const { description, category } = req.body;

    // Check if category exits in DB
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      throw new Error("Category is not available.");
    }

    // Check if user exits in DB
    const userExists = await User.findById(req.user);

    if (!userExists) {
      throw new Error("User not found");
    }

    const createdPost = await Post.create({
      description,
      category,
      image: req?.file,
      author: req?.user,
    });

    //push post into category
    categoryExists.posts.push(categoryExists?._id);

    //Resave the category
    await categoryExists.save();

    //push post to the user
    userExists.posts.push(createdPost?._id);

    //Resave the category
    await userExists.save();

    //Create notification
    await Notification.create({
      userId: req.user,
      postId: createdPost._id,
      message: `New update from ${userExists?.username}! Check out their latest post and interactions now.`,
    });

    //Send a notification email to followers
    userExists?.followers?.forEach(async (follower) => {
      const users = await User.find({ _id: follower });
      //Iterate the users array
      users.forEach((user) => {
        //Send notification
        sendNotification(user?.email, createdPost?._id);
      });
    });
    // Send response
    res.json({
      status: "success",
      message: "Post created",
      createdPost,
    });
  }),
  //! List posts
  listAllPosts: asyncHandler(async (req, res) => {
    const { title, category, page = 1, limit = 9 } = req.query;

    //Set basic filtering
    let filter = {};
    if (category) {
      filter.category = category;
    }

    if (title) {
      filter.description = { $regex: title, $options: "i" }; //Case insensitive
    }
    //Total posts based on filtering
    const totalPostsByFilter = await Post.countDocuments(filter);
    const allPosts = await Post.find(filter)
      .populate({
        path: "category",
        populate: {
          path: "author",
          model: "User",
        },
      })
      .populate("author")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({
      status: "success",
      message: "Posts fetched successfully",
      allPosts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPostsByFilter / limit),
    });
  }),
  //! Update a post
  updatePost: asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const { description, category } = req.body;

    const postFound = await Post.findById(postId);

    if (!postFound) {
      throw new Error("Post not found");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { description, image: req?.file, category },
      { new: true }
    );
    res.json({
      status: "success",
      message: "Post updated successfully",
      updatedPost,
    });
  }),
  //! Get a post
  getSinglePost: asyncHandler(async (req, res) => {
    //Get postId
    const postId = req.params.postId;

    //Get post viewer ID
    const userId = req.user ? req.user : null;

    const post = await Post.findById(postId)
      .populate([
        {
          path: "comments",
          populate: {
            path: "author",
            model: "User",
            select:
              "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires", // Exclude sensitive fields here
          },
        },
        {
          path: "category",
          populate: {
            path: "author",
            model: "User",
            select:
              "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires", // Exclude sensitive fields here
          },
        },
      ])
      .select(
        "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires"
      );
    if (!post) {
      throw new Error("Post not found.");
    }

    //Check if user has viewed post before or not and update
    if (userId) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: {
            viewers: userId,
          },
        },
        { new: true }
      );
    }
    res.json({
      status: "success",
      post,
    });
  }),
  //! Delete a post
  deletePost: asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const deletion = await Post.findByIdAndDelete(postId);
    if (!deletion) {
      throw new Error("Post is not available for deletion.");
    }
    res.json({
      status: "success",
      message: "Post deleted successfully",
    });
  }),
  //! Like a post
  like: asyncHandler(async (req, res) => {
    //Get post id
    const { postId } = req.params;
    //Get the user
    const userId = req.user;
    //Find the post
    const post = await Post.findById(postId);
    //Check if user has disliked the post before
    if (post?.dislikes?.includes(userId)) {
      post?.dislikes?.pull(userId);
    }
    //Check if user has liked the post before
    if (post?.likes?.includes(userId)) {
      post?.likes?.pull(userId);
    } else {
      post?.likes?.push(userId);
    }

    //Resave the post
    await post.save();
    //Send response
    res.json({
      status: "success",
      message: "You liked this post.",
    });
  }),
  //! Dislike a post
  dislike: asyncHandler(async (req, res) => {
    //Get post id
    const { postId } = req.params;
    //Get the user
    const userId = req.user;
    //Find the post
    const post = await Post.findById(postId);
    //Check if user has liked the post before
    if (post?.likes?.includes(userId)) {
      post?.likes?.pull(userId);
    }
    //Check if user has disliked the post before
    if (post?.dislikes?.includes(userId)) {
      post?.dislikes?.pull(userId);
    } else {
      post?.dislikes?.push(userId);
    }

    //Resave the post
    await post.save();
    //Send response
    res.json({
      status: "success",
      message: "You disliked this post.",
    });
  }),
};

export default postControllers;
