import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    //Get the login user
    const user = await User.findById(req.user);
    
    //Check if user is an admin
    if (user.role !== "admin") {
      return res
        .status(401)
        //Send response
        .json({ message: "Action denied. Only the admin can complete this action."});
    }
    // Move to next peice of middleware
    next();
} 
  catch (error) {
    return res.json(error);
  }
});
export default isAdmin;
