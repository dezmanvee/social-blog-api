import express from "express";
import userController from "../../controllers/user/userController.js";


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



export default userRouter;
