import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";

const isBlocked = asyncHandler(async (req, res, next) => {
  try {
    //Get the login user
    const user = await User.findById(req.user);
    
    //Check if user is an admin
    if (user?.isBlocked) {
      return res
        .status(401)
        //Send response
        .json({ message: "Your account has been suspended. Kindly contact the admin for support."});
    }
    // Move to next peice of middleware
    next();
} 
  catch (error) {
    return res.json(error);
  }
});
export default isBlocked;
