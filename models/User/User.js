import mongoose from "mongoose";
const crypto = await import("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: Object,
      default: null,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    authMethod: {
      type: String,
      required: true,
      enum: ["local", "google", "facebook", "linkdin"],
      default: "local",
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    accountVerificationToken: {
      type: String,
      default: null,
    },
    accountVerificationExpires: {
      type: Date,
      default: null,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    nextEarningDate: {
      type: Date,
      default: () => {
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      },
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    hasSelectedPlan: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: "user"
    },
    //Relations
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

//Generate Account Verification Token
userSchema.methods.generateAccVerificationEmail = function () {
  //Generate token
  const emailToken = crypto.randomBytes(20).toString("hex");

  //update accountVerificationToken
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

// update accountVerificationExpires
this.accountVerificationExpires = Date.now() + 10 * 60 * 1000 // Expires in 10mins

return emailToken
};

//Generate Password Reset Token
userSchema.methods.generatePassportResetTokenEmail = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //update accountVerificationToken
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

// update accountVerificationExpires
this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // Expires in 10mins

return resetToken
};

export const User = mongoose.model("User", userSchema);
