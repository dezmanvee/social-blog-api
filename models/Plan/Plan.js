import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
    },
    features: [String],
    limitations: [String],
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true })

export const Plan = mongoose.model('Plan', planSchema)