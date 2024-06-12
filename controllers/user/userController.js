import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";
import bcrypt from "bcrypt";
import passport from "../../utils/passport.js";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../../utils/nodemailer.js";
const crypto = await import('crypto');

const userController = {
  //!----------Register------------->
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    //check if user exists
    const userExists = await User.findOne({ username, email });

    if (userExists) {
      throw new Error("User already exists.");
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create user
    const registeredUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    //send response to client
    res.status(201).json({
      status: "success",
      message: "Registration completed.",
      registeredUser,
    });
  }),
  //!----------Login------------->
  login: asyncHandler(async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);

      //check if user exists.
      if (!user) {
        res.status(401).json(info.message);
      }
      //Generate token for user
      const authToken = jwt.sign({ id: user?._id }, process.env.JWT_SECRET);

      //Store token in HTTP-Only cookie
      res.cookie("authToken", authToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, //One day in milliseconds
      });
      //Send a response to the client
      res.status(200).json({
        status: "success",
        message: "Login successfully",
        username: user?.username,
        email: user?.email,
        _id: user?._id,
      });
    })(req, res, next);
  }),

  //!----------Google OAuth------------->
  googleOAuth: passport.authenticate("google", { scope: ["profile"] }),

  //!----------Google OAuth Callback------------->
  googleOAuthCallback: asyncHandler(async (req, res, next) => {
    passport.authenticate(
      "google",
      {
        failureRedirect: "/login",
        session: false,
      },
      (err, user, info) => {
        if (err) return next(err);

        if (!user) {
          return res.redirect("http://localhost:3000/google-login-error");
        }

        //Generate auth token
        const authToken = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
          expiresIn: "3d",
        });

        //Store authtoken in HTTP-Only cookie
        res.cookie("authToken", authToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000, //One day in milliseconds
        });

        //Redirect the user to the dashboard
        res.redirect("http://localhost:3000/dashboard");
      }
    )(req, res, next);
  }),

  //!----------Check User Authentication Status------------->
  userAuthStatus: asyncHandler(async (req, res) => {
    const authToken = req.cookies["authToken"];

    if (!authToken) {
      return res.status(401).json({ isAuthenticated: false });
    }

    try {
      const verified = jwt.verify(authToken, process.env.JWT_SECRET);

      const user = await User.findById(verified.id);
      if (!user) {
        return res.status(401).json({ isAuthenticated: false });
      } else {
        return res.status(200).json({
          _id: user?._id,
          username: user?.username,
          profilePicture: user?.profilePicture,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      return res.status(401).json({ isAuthenticated: false, error });
    }
  }),

  //!----------Logout User------------->
  logout: asyncHandler(async (req, res) => {
    res.cookie("authToken", "", { maxAge: 1 });
    res.status(200).json({
      message: "Logout successfully",
    });
  }),

  //!----------User Profile------------->
  userProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user)
      .populate("posts")
      .select(
        "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires"
      );
    res.json({
      user,
    });
  }),
  //!----------User Following and Followers------------->
  userFollowing: asyncHandler(async(req, res) => {
    //* Find user who wants to follow another user (req.user)
    const userId = req.user
    //* Get user who was followed (req.params)
    const {followId} = req.params
    //* Update the user profile who wants to follow another user
    await User.findByIdAndUpdate(userId, {
      $addToSet: {following: followId}
    }, {new: true})

    //* Update the user profile who was followed
    await User.findByIdAndUpdate(followId, {
      $addToSet: {followers: userId}
    }, {new: true})

    //* Send response
    res.json({
      status: 'success',
      message: 'You are now following this user.'
    })
  }),

  //!----------Users UnFollowing and Unfollowers------------->
  userUnollowing: asyncHandler(async(req, res) => {
    const userId = req.user
    const {unFollowId} = req.params
    
    //* Find user who wants to unfollow another user
    const user = await User.findById(userId);
   

    //* Get user who was unfollowed (req.params)
    const userUnfollow = await User.findById(unFollowId);

    if (!user || !userUnfollow) {
      throw new Error('User not found')
    }
    
    //* Update the user profile who wants to follow another user
    user.following.pull(unFollowId)

    //* Update the user profile who was followed  
    user.followers.pull(userId)

    // * Resave the users
    await user.save()
    await userUnfollow.save()

    //* Send response
    res.json({
      status: 'success',
      message: 'You are now unfollowing this user.'
    })
  }),
  //!----------Account verification email token------------->
  generateAccountEmailToken: asyncHandler( async(req, res) => {
   
    // Get the login user
    const user = await User.findById(req.user) 

    //Check if user exists or not
    if (!user) {
      throw new Error('User not found')
    }

    //Check if user email exists
    if (!user?.email) {
      throw new Error('User email doesn\'t exist.')
    }

    // Generate token for user
    const emailToken = await user.generateAccVerificationEmail()

    //Resave the user
    await user.save()

    //Send email
    sendVerificationEmail(user?.email, emailToken)
    
    //Send Response
    res.json({
      message: ` An account verification email has been sent to ${user?.email} and will expire in 10 minutes.`
    })
  }),

  //!----------Account verification email ------------->
  verifyAccountEmail: asyncHandler(async(req, res) => {
    //Get the token
    const {emailToken} = req.params
    
    //Convert token with the one saved in DB
    const verifyToken = crypto.createHash('sha256').update(emailToken).digest('hex')
    
    //Find user
    const user = await User.findOne({
      accountVerificationToken: verifyToken,
      accountVerificationExpires: {$gt: Date.now()}
    })
    
    if (!user) {
      throw new Error('Account verification token has expired.')
    }
    //Update user fields
    user.isEmailVerified = true;
    user.accountVerificationToken = null;
    user.accountVerificationExpires = null;

    //Resave user
    await user.save();
    res.json({
      message: 'Email verified.'
    })
  })
};
export default userController;
