import express from "express";
import dotenv from "dotenv";


dotenv.config()
const PORT = process.env.PORT || 8000;

const app = express();


app.get('/', (req, res) => {
    res.status(200).json({message: 'Server is running...'})
})


//! Start the server
app.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`);
})

