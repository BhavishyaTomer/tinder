import express from 'express'
import { protectRoute } from '../Protected Route/AuthRoute.js'
import { disLikeMeDaddy, getMyMatches, likeMeDaddy, showMeProfile } from '../Controller/swipeController.js'

const matchRouter=express.Router()

matchRouter.get("/swipe-right/:id",protectRoute,likeMeDaddy)
matchRouter.get("/swipe-left/:id",protectRoute,disLikeMeDaddy)
matchRouter.get("/getmymatches",protectRoute,getMyMatches)
matchRouter.get("/show-profiles",protectRoute,showMeProfile)



export default matchRouter