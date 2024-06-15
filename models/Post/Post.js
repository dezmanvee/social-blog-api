import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: { 
        type: Object
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true   
    },
    nextEarningDate: {
        type: Date,
        default: () => {
            new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // returns 1st day of every new/next month
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true, 
    },
    thisMonthEarnings: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    lastCalculatedViewsCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },

    //Interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

    //Comments
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],

    //Flag for moderation
    isBlocked: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)

export default Post;