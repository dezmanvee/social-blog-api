import express from "express";
import earningsController from "../../controllers/earnings/earningsController.js";



const router = express.Router();

  //! List posts
router.get("/", earningsController.listAllEarnings);



export default router;