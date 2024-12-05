import mongoose from "mongoose";
import { user } from "../Schema/user.schema.js"
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const likeMeDaddy = async (req, res) => {
    try {
        const { id } = req.params;
        
        const userToBeLiked = await user.findById(id);
        const originalUser = await user.findById(req.user._id);

        if (!userToBeLiked) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

    
        if (originalUser.likes.includes(id)) {
            return res.status(400).json({
                success: false,
                message: "User already liked",
            });
        }
        originalUser.likes.push(id)
        await originalUser.save()


   
        if (userToBeLiked.likes.includes(originalUser._id)) {

            console.log("entered matching state")
            originalUser.matches.push(userToBeLiked);
            userToBeLiked.matches.push(originalUser);


            await Promise.all([originalUser.save(), userToBeLiked.save()]);


            const connectedUsers = getConnectedUsers();
            const io = getIO();
    
            const likedUserSocketId = connectedUsers.get(userToBeLiked._id.toString());
             console.log("user to be liked id",likedUserSocketId)
            if (likedUserSocketId) {
                io.to(likedUserSocketId).emit("newMatch", {
                    _id: originalUser._id,
                    name: originalUser.fullName,
                    image: originalUser.ImageUrl,
                });
            }
    
            const currentSocketId = connectedUsers.get(originalUser._id.toString());
            console.log("original liked id",currentSocketId)
            if (currentSocketId) {
                io.to(currentSocketId).emit("newMatch", {
                    _id: userToBeLiked._id,
                    name: userToBeLiked.name,
                    image: userToBeLiked.ImageUrl,
                });
            }
            
            
        }
     

        res.status(200).json({
            success: true,
            message: "User liked",
        });
    } catch (error) {
        console.error("Error in likeMeDaddy:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


export const disLikeMeDaddy=async(req,res)=>{
    try {
        const {id}=req.params
        const userToBeDisLiked=await user.findById(id)
        if (!userToBeDisLiked) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
    
        // Check if already liked
        if (userToBeDisLiked.likes.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "User already disliked",
            });
        }
        userToBeDisLiked.disLikes.push(req.user)
        userToBeDisLiked.save()
        res.status(200).json({success:true,
            message:"liked"
        })
    } catch (error) {
        console.error("Error in likeMeDaddy:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
        
    }

}


export const getMyMatches = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch the user with populated matches
        const myMatches = await user
            .findById(userId)
            .populate("matches", "fullName ImageUrl");

        // If no matches exist
        if (!myMatches || myMatches.matches.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No matches yet",
            });
        }

        // Return matches
        res.status(200).json({
            success: true,
            matches: myMatches.matches,
        });
    } catch (error) {
        console.error("Error in getMyMatches:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const showMeProfile = async (req, res) => {
    try {
      const { page = 1 } = req.query;
      const pageSize = 10;
      const skipProfiles = (page - 1) * pageSize;
  
      // Ensure req.user._id is converted to ObjectId
      const currentUserId = new mongoose.Types.ObjectId(req.user._id);
  
      // Ensure likes and disLikes are arrays of ObjectId
      const likes = (req.user.likes || []).map((id) => new mongoose.Types.ObjectId(id));
      const disLikes = (req.user.disLikes || []).map((id) => new mongoose.Types.ObjectId(id));
  
      // Query to find profiles excluding the current user and liked/disliked users
      const profilesToShow = await user
        .find({
          _id: {
            $ne: currentUserId, // Exclude the current user
            $nin: [...likes, ...disLikes], // Exclude liked/disliked users
          },
        })
        .sort({ createdAt: -1 }) 
        .skip(skipProfiles)
        .limit(pageSize)
        .exec();
       
  
      if (!profilesToShow || profilesToShow.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No more profiles to show",
          profilesToShow: [],
        });
      }
  

  
      res.status(200).json({
        success: true,
        profilesToShow,
        page,
        pageSize,
      });
    } catch (error) {
      console.error("Error in getting profiles:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };