import {Plan} from "../../models/Plan/Plan.js";
import asyncHandler from "express-async-handler";

const planControllers = {
  //! Create a plan
  createPlan: asyncHandler(async (req, res) => {
    const { planName, features, price } = req.body;

    //check if plan exits
    const planExits = await Plan.findOne({ planName });

    if (planExits) {
      throw new Error("Plan already exists");
    }

    //check if a user already has two plans
    const planCount = await Plan.countDocuments()

    if (planCount >= 2) {
      throw new Error('You cannot add more than two plans')
    }

    const planCreated = await Plan.create({
      planName,
      features,
      price,
      user: req.user
    });

    res.json({
      status: "success",
      message: "Plan created",
      planCreated,
    });
  }),

  //! List plans
  listAllPlans: asyncHandler(async (req, res) => {
    const allPlans = await Plan.find();
    res.json({
      status: "success",
      message: "Plans fetched",
      allPlans,
    });
  }),
  //! Update a plan
  updatePlan: asyncHandler(async (req, res) => {
    const planId = req.params.planId;
    
    //find plan in model
    const planFound = await Plan.findById(planId);

    if (!planFound) {
      throw new Error("Plan not found");
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        planName: req.body.planName,
        features: req.body.features,
        price: req.body.price,
      },
      { new: true }
    );
    res.json({
      status: "success",
      message: "Plan updated",
      updatedPlan,
    });
  }),
  //! Get a plan
  getSinglePlan: asyncHandler(async (req, res) => {
    const planId = req.params.planId;

    const plan = await Plan.findById(planId);
    res.json({
      status: "success",
      plan,
    });
  }),
  //! Delete a plan
  deletePlan: asyncHandler(async (req, res) => {
    const planId = req.params.planId;

    await Plan.findByIdAndDelete(planId);
    res.json({
      status: "success",
      message: "Plan deleted",
    });
  }),
};

export default planControllers;  
