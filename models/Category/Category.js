import mongoose, { Types } from 'mongoose';

const categorySchema = new mongoose.Schema({
    categoryName: {type: String, required: true},
    description: {type: String},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true })

export const Category = mongoose.model('Category', categorySchema)