import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";
import bcrypt from "bcrypt";
import passport from "../../utils/passport.js";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  PasswordResetEmail,
} from "../../utils/nodemailer.js";
const crypto = await import("crypto");

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
        return res.status(401).json(info.message);
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
        res.redirect("http://localhost:3000/dashboard/account/summary");
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
          createdAt: user?.createdAt,
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
      .populate({
        path: "posts",
        populate: {
          path: "category",
          model: "Category",
        },
      })
      .select(
        "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires"
      );
    res.json({
      user,
    });
  }),
  //!----------User Following and Followers------------->
  userFollowing: asyncHandler(async (req, res) => {
    //* Find user who wants to follow another user (req.user)
    const userId = req.user;
    //* Get user who was followed (req.params)
    const { followId } = req.params;
    //* Update the user profile who wants to follow another user
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      { new: true }
    );

    //* Update the user profile who was followed
    await User.findByIdAndUpdate(
      followId,
      {
        $addToSet: { followers: userId },
      },
      { new: true }
    );

    //* Send response
    res.json({
      status: "success",
      message: "You are now following this user.",
    });
  }),

  //!----------Users UnFollowing and Unfollowers------------->
  userUnollowing: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { unFollowId } = req.params;

    //* Find user who wants to unfollow another user
    const user = await User.findById(userId);

    //* Get user who was unfollowed (req.params)
    const userUnfollow = await User.findById(unFollowId);

    if (!user || !userUnfollow) {
      throw new Error("User not found");
    }

    //* Update the user profile who wants to follow another user
    user.following.pull(unFollowId);

    //* Update the user profile who was followed
    user.followers.pull(userId);

    // * Resave the users
    await user.save();
    await userUnfollow.save();

    //* Send response
    res.json({
      status: "success",
      message: "You are now unfollowing this user.",
    });
  }),
  //!----------Account verification email token------------->
  generateAccountEmailToken: asyncHandler(async (req, res) => {
    // Get the login user
    const user = await User.findById(req.user);

    //Check if user exists or not
    if (!user) {
      throw new Error("User not found");
    }

    //Check if user email exists
    if (!user?.email) {
      throw new Error("User email doesn't exist.");
    }

    // Generate token for user
    const emailToken = await user.generateAccVerificationEmail();

    //Resave the user
    await user.save();

    //Send email
    sendVerificationEmail(user?.email, emailToken);

    //Send Response
    res.json({
      message: `A verification email has been sent to ${user?.email}. Kindly verify your account within the next 10 minutes before the link expires.`,
    });
  }),

  //!----------Account verification email ------------->
  verifyAccountEmail: asyncHandler(async (req, res) => {
    //Get the token
    const { emailToken } = req.params;

    //Convert token with the one saved in DB
    const verifyToken = crypto
      .createHash("sha256")
      .update(emailToken)
      .digest("hex");

    //Find user
    const user = await User.findOne({
      accountVerificationToken: verifyToken,
      accountVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error(
        "Your account verification token has expired. Please request a new one to complete the verification process."
      );
    }
    //Update user fields
    user.isEmailVerified = true;
    user.accountVerificationToken = null;
    user.accountVerificationExpires = null;

    //Resave user
    await user.save();
    res.json({
      message:
        "Your email has been successfully verified. You now have full access to your account.",
    });
  }),

  //!----------Password Reset Token------------->
  generatePassportResetToken: asyncHandler(async (req, res) => {
    try {
      // Get the user email
    const { email } = req.body;

    //Find user by email
    const user = await User.findOne({ email });

    //Check if user exists or not
    if (!user) {
      return res.status(400).json({
        message: `We couldn't find an account associated with the email ${user?.email} in our records. Please double-check and try again.`
      })
    }

    //If user did not register with local strategy
    if (user.authMethod !== "local") {

      return res.status(400).json({
        message: "It looks like you signed up with Google. Please log in using your Google account."
      })
    }

    //Generate email token
    const resetToken = await user.generatePassportResetTokenEmail();

    //Resave the user
    await user.save();

    // Send email
    PasswordResetEmail(user?.email, resetToken);

    //Send Response
    return res.status(200).json({
      message: `A password reset link has been sent to ${user?.email}. Please check your email and use the link within 10 minutes to reset your password.`,
    });
      
    } catch (error) {
      return res.status(500).json({
        message: "An error occured during tken generating process. Please try again later."
      })
    }
  }),

  //!----------Password Reset Verification ------------->
  verifyPasswordReset: asyncHandler(async (req, res) => {
    try {
      //Get the token
      const { resetToken } = req.params;

      //Get the password
      const { password } = req.body;

      //Convert token with the one saved in DB
      const verifyToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      //Find user
      const user = await User.findOne({
        passwordResetToken: verifyToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Your account verification token has expired. Please request a new one to complete the verification process.",
        });
      }

      //Update the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Update user fields
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      //Save the updated user
      await user.save();

      //Respond with success
      return res.status(201).json({
        message:
          "Your password has been successfully reset. You can now log in with your new credentials.",
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occured during password reset process. Please try again later.",
      });
    }
  }),
  //!----------Update Account Email ------------->
  updateAccountEmail: asyncHandler(async (req, res) => {
    // Get the email
    const { email } = req.body;

    // Find the user
    const user = await User.findById(req.user);

    // Update email
    user.email = email;

    // Set isEmailVerified to false in order to send email verification
    user.isEmailVerified = false;

    // Save user
    await user.save();

    // Generate token for user
    const emailToken = await user.generateAccVerificationEmail();

    // Send email
    sendVerificationEmail(user?.email, emailToken);

    // Send response
    res.json({
      message: `An account verification email has been sent to ${user?.email} and will expire in 10 minutes.`,
    });
  }),
  //!----------Upload Profile Photo ------------->
  UploadProfilePhoto: asyncHandler(async (req, res) => {
    // Find user and update profile photo
    await User.findByIdAndUpdate(
      req.user,
      {
        $set: {
          profilePicture: req.file,
        },
      },
      { new: true }
    );
    //* Send response
    res.json({
      message:
        "Your profile picture has been successfully uploaded! You're all set—your new image will now be visible on your profile.",
    });
  }),
  //!----------Block User ------------->
  blockUser: asyncHandler(async (req, res) => {
    // Find the userId
    const { userId } = req.body;

    // Find user and update the isBlocked property
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      { new: true }
    );
    // Checked if user exist
    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
    } else {
      res.json({
        message: `The user, ${user?.username}'s account has been blocked. ${user?.username} will no longer have access to their account or platform features until further notice.`,
        username: user?.username,
        isBlocked: user?.isBlocked,
      });
    }
  }),
  //!----------Unblock User ------------->
  unBlockUser: asyncHandler(async (req, res) => {
    // Find the userId
    const { userId } = req.body;

    // Find user and update the isBlocked property
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      { new: true }
    );
    // Checked if user exist
    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
    } else {
      res.json({
        message: `The user, ${user?.username}'s account has been successfully unblocked and access to the platform features has been restored`,
        username: user?.username,
        isBlocked: user?.isBlocked,
      });
    }
  }),
  //!----------Get All Users ------------->
  users: asyncHandler(async (req, res) => {
    //Find the users
    const users = await User.find().populate("plan");

    // Send response
    res.json({
      message: " Users fetched successfully.",
      users,
    });
  }),
  //!----------Make As Admin ------------->
  userIsAdmin: asyncHandler(async (req, res) => {
    //Get the userId
    const { userId } = req.body;
    //Find user and update the isAdmin property
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    );
    // Checked if user exist
    if (!user) {
      res.json({
        message: "User not found.",
      });
    } else {
      //Send the response
      res.json({
        message: `${user?.username} is now an admin.`,
        role: user?.role,
      });
    }
  }),
  //!----------Remove As Admin ------------->
  userIsNotAdmin: asyncHandler(async (req, res) => {
    //Get the userId
    const { userId } = req.body;
    //Find user and update the isAdmin property
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true }
    );
    // Checked if user exist
    if (!user) {
      res.json({
        message: "User not found.",
      });
    } else {
      //Send the response
      res.json({
        message: `${user?.username} is no longer an admin.`,
        role: user?.role,
      });
    }
  }),
  //!----------Delete A User ------------->
  deleteUser: asyncHandler(async (req, res) => {
    // Get user's ID
    const userId = req.params.userId;

    const deletion = await User.findByIdAndDelete(userId);
    if (!deletion) {
      throw new Error("User is not available for deletion.");
    }
    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  }),

  //!----------Get Third User Profile------------->
  thirdUserProfile: asyncHandler(async (req, res) => {
    //Get the userId
    const { userId } = req.params;

    //Find user
    const user = await User.findById(userId).select(
      "-password -passwordResetToken -passwordResetExpires -accountVerificationToken -accountVerificationExpires"
    );
    //Check if user exist
    if (!user) {
      res.json({ message: "User not found." });

      //Send response
    } else {
      res.json({ status: "success", user });
    }
  }),
};
export default userController;
