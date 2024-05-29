import express from "express";
import planControllers from "../../controllers/plans/planControllers.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";

const router = express.Router();
 

//! Create a plan
router.post("/create", isAuthenticated, planControllers.createPlan)


  //! List plans
router.get("/", planControllers.listAllPlans);

  //! Update a plan
router.put("/:planId", isAuthenticated, planControllers.updatePlan);

  //! Get a plan
router.get('/:planId', planControllers.getSinglePlan)


  //! Delete a plan
router.delete('/:planId', isAuthenticated, planControllers.deletePlan)

export default router;