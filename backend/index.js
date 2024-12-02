import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import fileUpload from 'express-fileupload';
import path from 'path'
import cookieParser from 'cookie-parser';
import userRouter from './Route/userRoute.js';
import matchRouter from './Route/matchRoute.js';


const app=express()
const __dirname=path.resolve()

dotenv.config()
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'], 
}));
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
    app.listen(process.env.PORT,()=>{
        console.log("server is started at ",process.env.PORT)
    })
}).catch(()=>{
    console.log("DB Problems")
})
