import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoDB.js";
import passport from "./utils/passport.js";
import postRouters from "./routes/posts/postRoutes.js"
import categoryRouters from "./routes/categories/categoryRoutes.js"
import planRouters from "./routes/plans/planRoutes.js"
import userRouters from "./routes/user/userRoutes.js";



const PORT = process.env.PORT || 8000;

//!connect DB
connectDB();

const app = express();  

 

//!Middlewares
app.use(express.json()); //gets payload from req body
app.use(cookieParser()); // gets authToken from req cookies
app.use(express.urlencoded({extended: true})) //gets form data from req body


//* passport middleware
app.use(passport.initialize())

//* cors middleware
const corseOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};
app.use(cors(corseOptions)); //grant requests to server from listed origins

//!Initialize posts routes
app.use('/api/v1/posts', postRouters)

//!Initialize categories routes
app.use('/api/v1/categories', categoryRouters)

//!Initialize plans routes
app.use('/api/v1/plans', planRouters)

//!Initialize users routes
app.use('/api/v1/users', userRouters)

//! Not found handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Page does not exist!',
  })
})
 
//! Error Handler
app.use((err, req, res, next) => {
    const message = err.message
    res.status(500).json({
        message,
    })
})
 

// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Server is running..." });
// });

//! Start the server
app.listen(PORT, () => {
  console.log(`Starting server on port ${PORT}`);
});
