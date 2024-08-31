import Stripe from "stripe";
import mongoose from "mongoose";
import { Plan } from "../../models/Plan/Plan.js";
import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User.js";
import { Payment } from "../../models/Payment/Payment.js";

//* Stripe payment configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripePaymentControllers = {
  //! Payment Intent
  payment: asyncHandler(async (req, res) => {
    //Get Subscription plan ID
    const { subscriptionPlanId } = req.body;
    //Verify Subscription plan ID
    if (!mongoose.isValidObjectId(subscriptionPlanId)) {
      return res.json({ message: "Invalid subscription plan." });
    }
    //Check if plan exists.
    const plan = await Plan.findById(subscriptionPlanId);
    if (!plan) {
      return res.json({ message: "Subscription plan does not exits." });
    }
    //Get the user
    const user = req.user;

    //Create payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price * 100,
        currency: "usd",
        metadata: {
          userId: user?.toString(),
          subscriptionPlanId,
        },
      });
      //Send response to client
      res.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionPlanId,
      });
    } catch (error) {
      res.json({ error });
    }
  }),
  //! Verify Payment
  verify: asyncHandler(async (req, res) => {
    //Get payment ID
    const { paymentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    //*----------Confirm payment status-----------
    if (paymentIntent?.status !== "success") {
      //Get data from metadata
      const { userId, subscriptionPlanId } = paymentIntent?.metadata;

      //Find the user
      const userExists = await User.findById(userId);

      if (!userExists) {
        return res.json({ message: "User not found." });
      }
      //Get payment details
      const amount = paymentIntent?.amount / 100;
      const currency = paymentIntent?.currency?.toUpperCase();

      //Create payment history
      const newPayment = await Payment.create({
        user: userId,
        status: "success",
        amount,
        currency,
        reference: paymentId,
        subscriptionPlan: subscriptionPlanId,
      });
      //Update user profile
      if (newPayment) {
        userExists.plan = subscriptionPlanId;
        userExists.hasSelectedPlan = true;
        //Resave the user
        await userExists.save();
      }
      //Send response to client
      res.json({
        status: "success",
        message: "Payment Successful!",
        email: userExists?.email,
      });
    }
  }),

  //! Free plan
  freePlan: asyncHandler(async (req, res) => {
    // try {
    //   //Find user
    //   const user = await User.findById(req?.user);

    //   if (!user) {
    //     throw new Error("User does not exist.");
    //   }

    //   //create paymentId,current and subscriptionPlanId
    //   const currency = "USD"; // Standard currency format
    //   const paymentId = "PAY-1234567890ABCDEF"; // A more realistic payment ID format
    //   const subscriptionPlanId = "611a9f5eb6131c1f3c3d2e90"; // Example MongoDB ObjectId-like string
    //   const amount = 0; // Since it’s a free plan

    //   //Create payment history
    //   const newPayment = await Payment.create({
    //     user: user,
    //     status: "success",
    //     amount,
    //     currency,
    //     reference: paymentId,
    //     subscriptionPlan: subscriptionPlanId,
    //   });

    //   //Update user profile
    //   if (newPayment) {
    //     user.plan = subscriptionPlanId;
    //     user.hasSelectedPlan = true;
    //     //Resave the user
    //     await user.save();
    //   }

    //   // //Check if user already has a plan
    //   // if (user.hasSelectedPlan === true) {
    //   //   throw new Error('You have an exixting plan.')
    //   // }
    //   // // Update user hasSelectedPlan property
    //   // user.hasSelectedPlan = true;
    //   // user.plan = "Free"

    //   // //Resave user
    //   // await user.save()

    //   //Send response
    //   res.json({
    //     status: "succes",
    //     message: "Free plan activated.",
    //     email: user?.email,
    //   });
    // } catch (error) {
    //   res.json(error);
    // }

    try {
      // Find user
      const user = await User.findById(req?.user?._id || req?.user);
    
      if (!user) {
        return res.status(404).json({ status: "error", message: "User does not exist." });
      }
    
      // Create paymentId, currency, and subscriptionPlanId
      const currency = "USD"; // Standard currency format
      const paymentId = "PAY-1234567890ABCDEF"; // A more realistic payment ID format
      const subscriptionPlanId = new mongoose.Types.ObjectId("611a9f5eb6131c1f3c3d2e90"); // Convert string to ObjectId
      const amount = 0; // Since it’s a free plan
    
      // Create payment history
      const newPayment = await Payment.create({
        user: user._id, // Store only the ID
        status: "success",
        amount,
        currency,
        reference: paymentId,
        subscriptionPlan: subscriptionPlanId, // Store as ObjectId
      });
    
      // Update user profile
      if (newPayment) {
        user.plan = subscriptionPlanId;
        user.planName = "Free",
        user.hasSelectedPlan = true;
        await user.save();
      }
    
      // Send response
       res.json({
        status: "success",
        message: "Free plan activated.",
        email: user?.email,
      });
    } catch (error) {
      // Return a structured error response
      return res.status(500).json({
        status: "error",
        message: error.message || "An error occurred.",
      });
    }
    
  }),
};

export default stripePaymentControllers;
