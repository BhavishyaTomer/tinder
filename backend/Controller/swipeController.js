import { user } from "../Schema/user.schema.js"

export const likeMeDaddy = async (req, res) => {
    try {
        const { userId } = req.params;
        const userToBeLiked = await user.findById(userId);
        const originalUser = await user.findById(req.user._id);

        if (!userToBeLiked) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user has already liked
        if (userToBeLiked.likes.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "User already liked",
            });
        }

        // Check if both users have liked each other (match)
        if (originalUser.likes.includes(userToBeLiked._id)) {
            // Add to matches for both users
            originalUser.matches.push(userToBeLiked);
            userToBeLiked.matches.push(originalUser);

            // Save both users at the same time
            await Promise.all([originalUser.save(), userToBeLiked.save()]);
        }

        // Add the user to the liked list
        userToBeLiked.likes.push(req.user);
        await userToBeLiked.save();

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
        const {userId}=req.params
        const userToBeDisLiked=await user.findById(userId)
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


export const showMeProfile=async(req,res)=>{
    try {
        const {page=1}=req.query;
        const pageSize=10;
        const skipProfiles=(page-1)*pageSize;
        const profilesToShow=user.find({_id:{$ne:req.user._id}}).skip(skipProfiles).limit(pageSize).exec();
        if(!profilesToShow)
        {
            res.status(500).json({
                message:"no more profiles to show"
            })
        }
        res.status(200).json({
            success: true,
            profilesToShow,
            page,
            pageSize,
        });
    } catch (error) {
        
    }
}