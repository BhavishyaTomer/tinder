import express from 'express'
import { createUser, loginUser, logout, myInfo, updateUserDetails } from '../Controller/userController.js'
const userRouter=express.Router()

userRouter.post("/register",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/logout",logout)
userRouter.post("/update/:id",updateUserDetails)
userRouter.get("/my-info",myInfo)



export default userRouter