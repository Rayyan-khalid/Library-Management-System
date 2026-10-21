// OR if you use ES Modules (import)
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '1.0.0.1']);


import express from "express"
import 'dotenv/config'
import connectDB from './lib/db.js'
import cloudinary from './lib/cloudinary.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import fs from "fs";   //fs stands for File System
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js'



const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {                //fs.existsSync(path) :- This checks: "does this file or folder already exist?"
  fs.mkdirSync(uploadDir);                 // mkdir = "make directory:- creates a folder named "uploads"
}

// Create Express app and HTTP server
const app = express();
// const server = http.createServer(app);


// Middleware setup
app.use(cors());
app.use(express.json({limit: '4mb'}));

app.use(cookieParser());


// Routes Setup
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)



// Connect to MONGOD
await connectDB();


// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    
})