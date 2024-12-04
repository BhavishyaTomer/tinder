import cloudinary from '../lib/cloudinary.js';
import {user} from '../Schema/user.schema.js'
import jwt from "jsonwebtoken";

const signToken = (id) => {
	// jwt token
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};


export const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", // Automatically detect the resource type
        });
        return result.secure_url; // Return the secure URL
    } catch (error) {
        console.error("Error in uploadToCloudinary:", error);
        throw new Error("Image upload failed");
    }
};

export const createUser = async (req, res) => {
    try {
        const { fullName, height, weight, religion, password, age, gender, prefferedGender, email } = req.body;

        if (!fullName || !height || !weight || !religion || !password || !age || !gender || !prefferedGender || !email) {
            return res.status(400).json({ message: "Enter all fields" });
        }

        if (!req.files || !req.files.ImageUrl) {
            return res.status(400).json({ message: "Please upload an image" });
        }

        if (age < 18) {
            return res.status(400).json({ message: "Age should be more than 18" });
        }

        // Check if user already exists
        const existingUser = await user.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Upload image
        const ImageUrl = await uploadToCloudinary(req.files.ImageUrl.tempFilePath);
        if (!ImageUrl) {
            return res.status(500).json({ message: "Image upload failed" });
        }

        // Create user
        const createdUser = await user.create({
            fullName,
            height,
            weight,
            religion,
            password,
            gender,
            prefferedGender,
            email,
            age,
            ImageUrl, // Add the uploaded image URL
        });

        const token = signToken(createdUser._id);

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			httpOnly: true, // prevents XSS attacks
			sameSite: "strict", // prevents CSRF attacks
		});

        res.status(201).json({ message: "User created successfully", myUser: createdUser });
    } catch (error) {
        console.error("Error in createUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Enter email and password" });
        }

        // Find user by email
        const existingUser = await user.findOne({ email }).select("+password"); // Explicitly include password
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate password
        const isPasswordValid = await existingUser.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = signToken(existingUser._id);

        // Set token as HTTP-only cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly: true, // Prevent XSS attacks
            sameSite: "strict", // Prevent CSRF attacks
        });

        res.status(200).json({
            message:"Sucess",
            myUser: {
                id: existingUser._id,
                fullName: existingUser.fullName,
                email: existingUser.email,
                ImageUrl: existingUser.ImageUrl,
            },
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const logout = async (req, res) => {
	res.clearCookie("jwt");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};


export const updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.params; // Get the user ID from the request parameters
        const { fullName, height, weight, religion, gender, preferredGender, age } = req.body;

        // Validate user existence
        const existingUser = await user.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optional: Upload a new image if provided
        let ImageUrl = existingUser.ImageUrl; // Default to the existing image
        if (req.files && req.files.ImageUrl) {
            ImageUrl = await uploadToCloudinary(req.files.ImageUrl.tempFilePath);
            if (!ImageUrl) {
                return res.status(500).json({ message: "Image upload failed" });
            }
        }

        // Update user fields
        existingUser.fullName = fullName || existingUser.fullName;
        existingUser.height = height || existingUser.height;
        existingUser.weight = weight || existingUser.weight;
        existingUser.religion = religion || existingUser.religion;
        existingUser.gender = gender || existingUser.gender;
        existingUser.preferredGender = preferredGender || existingUser.preferredGender;
        existingUser.age = age || existingUser.age;
        existingUser.ImageUrl = ImageUrl;

        // Save updated user
        const updatedUser = await existingUser.save();

        res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error in updateUserDetails:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const myInfo=async(req,res)=>{
    try {
       const myUser=req.user;

      
       res.status(200).json({
        message:"Sucess",
        myUser:{
            id: myUser._id,
                fullName: myUser.fullName,
                email: myUser.email,
                ImageUrl: myUser.ImageUrl,
        }
       }) 
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}
