import express from "express";
import userController from "../../controllers/user/userController.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";


const userRouter = express.Router()

//*----------Register User------------
userRouter.post('/register', userController.register);

//*----------Login User------------
userRouter.post('/login', userController.login);

//*----------Google OAuth for User------------
userRouter.get('/auth/google', userController.googleOAuth);

//*----------Google OAuth Callback for User------------
userRouter.get('/auth/google/callback', userController.googleOAuthCallback);

//*----------Auth Status for User------------
userRouter.get('/user-auth-status', userController.userAuthStatus);

//*----------Logout User------------
userRouter.post('/logout', userController.logout);

//*----------Logout User------------
userRouter.get('/profile', isAuthenticated, userController.userProfile);

//*---------- User Following------------
userRouter.put('/following/:followId', isAuthenticated, userController.userFollowing);

//*---------- User Following------------
userRouter.put('/unfollowing/:unFollowId', isAuthenticated, userController.userUnollowing);

//*---------- Account Verification Email Token------------
userRouter.put('/generate-account-email-token', isAuthenticated, userController.generateAccountEmailToken);

//*---------- Account Verification Email------------
userRouter.put('/verify-account-email/:emailToken', isAuthenticated, userController.verifyAccountEmail);



export default userRouter;
