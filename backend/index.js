import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import fileUpload from 'express-fileupload';
import path from 'path'
import cookieParser from 'cookie-parser';
import userRouter from './Route/userRoute.js';
import matchRouter from './Route/matchRoute.js';
import { createServer } from 'http';
import { initializeSocket } from './socket/socket.server.js';


const app=express()
const __dirname=path.resolve()
const httpServer=createServer(app)
dotenv.config()
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'], 
}));
initializeSocket(httpServer)
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload(
    {
        useTempFiles:true,
        tempFileDir:path.join(__dirname,"temp"),createParentPath:true
    }
))
app.use("/api",userRouter)
app.use("/api",matchRouter)



mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
    httpServer.listen(process.env.PORT,()=>{
        console.log("server is started at ",process.env.PORT)
    })
}).catch(()=>{
    console.log("DB Problems")
})




// PORT=8000
// MONGO_DB_URI=mongodb+srv://bhavishyatomer:WM34ZuDXJWlNEwfB@cluster0.8skve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// JWT_SECRET=secret1234
// CLOUDINARY_API_KEY=862145599261932
// CLOUDINARY_API_SECRET=hkef_aMZl6MOupqIgvyjqLmPkzU
// CLOUDINARY_CLOUD_NAME=dy94jla0h
// NODE_ENV=DEVELOPMENT
// NODE_TLS_REJECT_UNAUTHORIZED=0
