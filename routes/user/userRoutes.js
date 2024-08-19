import express from "express";
import multer from "multer";
import userController from "../../controllers/user/userController.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";
import storage from "../../utils/upload.js";
import isAdmin from "../../middlewares/isAdmin/isAdmin.js";


//! Instance of multer
const fileUpload = multer({
    storage,
  });


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

//*----------Delete User------------
userRouter.delete('/:userId', isAuthenticated, isAdmin, userController.deleteUser);

//*----------Logout User------------
userRouter.get('/profile', isAuthenticated, userController.userProfile);

//*----------Get all Users------------
userRouter.get('/list', isAuthenticated, userController.users);

//*---------- User Following------------
userRouter.put('/following/:followId', isAuthenticated, userController.userFollowing);

//*---------- User Following------------
userRouter.put('/unfollowing/:unFollowId', isAuthenticated, userController.userUnollowing);

//*---------- Account Verification Email Token------------
userRouter.put('/generate-account-email-token', isAuthenticated, userController.generateAccountEmailToken);

//*---------- Account Verification Email------------
userRouter.put('/verify-account-email/:emailToken', isAuthenticated, userController.verifyAccountEmail);

//*---------- Account Verification Email------------
userRouter.post('/forgot-password', userController.generatePassportResetToken);

//*---------- Account Verification Email------------
userRouter.post('/verify-forgot-password/:resetToken', userController.verifyPasswordReset);

//*----------Update Email------------
userRouter.put('/update-account-email', isAuthenticated, userController.updateAccountEmail);

//*----------Upload Profile Photo------------
userRouter.put('/upload-profile-photo', isAuthenticated, fileUpload.single("image"), userController.UploadProfilePhoto);

//*----------Block user------------
userRouter.put('/account-inactive', isAuthenticated, isAdmin, userController.blockUser);

//*----------Unblock user------------
userRouter.put('/account-active', isAuthenticated,  isAdmin, userController.unBlockUser);

//*----------User is Admin------------
userRouter.put('/is-admin', isAuthenticated,  isAdmin, userController.userIsAdmin);

//*----------User is not Admin------------
userRouter.put('/is-not-admin', isAuthenticated,  isAdmin, userController.userIsNotAdmin);


export default userRouter;
