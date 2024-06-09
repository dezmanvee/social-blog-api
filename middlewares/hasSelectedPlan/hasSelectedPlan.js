import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";

const checkHasSelectedPlan = asyncHandler(async (req, res, next) => {
  try {
    //Get the login user
    const user = await User.findById(req.user);
 
    if (!user?.hasSelectedPlan) {
      return res
        .status(401)
        .json({ message: "Please select a plan before creating posts."});
    }
    next();
} 
  catch (error) {
    return res.json(error);
  }
});
export default checkHasSelectedPlan;
