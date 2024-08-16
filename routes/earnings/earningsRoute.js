import express from "express";
import earningsController from "../../controllers/earnings/earningsController.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";



const router = express.Router();

  //! List all earnings
router.get("/", earningsController.listAllEarnings);

  //! List a user earnings
router.get("/my-earnings", isAuthenticated, earningsController.getMyEarnings);



export default router;