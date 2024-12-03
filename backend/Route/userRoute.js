import express from 'express'
import { protectRoute } from '../Protected Route/AuthRoute.js'
import { createUser, loginUser, logout, myInfo, updateUserDetails } from '../Controller/userController.js'
const userRouter=express.Router()

userRouter.post("/register",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/logout",logout)
userRouter.post("/update/:id",updateUserDetails)
userRouter.get("/my-info",protectRoute,myInfo)



export default userRouter