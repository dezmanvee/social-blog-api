import express from "express";
import planControllers from "../../controllers/plans/planControllers.js";
import isAuthenticated from "../../middlewares/isAuthenticated/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin/isAdmin.js";

const router = express.Router();
 

//! Create a plan
router.post("/create", isAuthenticated, isAdmin, planControllers.createPlan)


  //! List plans
router.get("/", planControllers.listAllPlans);

  //! Update a plan
router.put("/:planId", isAuthenticated, isAdmin, planControllers.updatePlan);

  //! Get a plan
router.get('/:planId', planControllers.getSinglePlan)


  //! Delete a plan
router.delete('/:planId', isAuthenticated, isAdmin, planControllers.deletePlan)

export default router;