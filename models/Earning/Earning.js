import  mongoose  from "mongoose";


const earningSchema = new mongoose.Schema({
    amount: {
        type: Number, 
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
         required: true
        },
    post: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post'
    },
    calculatedOn: {
        type: Date, 
        default: Date.now
    }
    
}, { timestamps: true })

export const Earning = mongoose.model('Earning', earningSchema);