import mongoose from "mongoose";



//! configure MongoDB
const connectDB = async () => {
    // console.log(process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to DB successfully');
    } catch (err) {
        console.log('Error connecting DB', err.message);
        process.exit(1)
    }
}
export default connectDB;