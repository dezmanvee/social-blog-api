import  mongoose  from "mongoose";


const profanityFilterSchema = new mongoose.Schema({
    bannedWords: [String]
    
}, { timestamps: true })

export const ProfanityFilter = mongoose.model('ProfanityFilter', profanityFilterSchema);