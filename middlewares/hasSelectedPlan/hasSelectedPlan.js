import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";

const checkHasSelectedPlan = asyncHandler(async (req, res, next) => {
  try {
    //Get the login user
    const user = await User.findById(req.user);
    
    //Check verification status
    if (!user?.hasSelectedPlan) {
      return res
        .status(401)
        //Send response
        .json({ message: "Action denied. Please select a plan before creating posts."});
    }
    // Move to next peice of middleware
    next();
} 
  catch (error) {
    return res.json(error);
  }
});
export default checkHasSelectedPlan;
