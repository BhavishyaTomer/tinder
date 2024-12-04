import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema= new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    ImageUrl:{
        type:String,
        required:true
    },
    email: {
        type: String, // Use 'String' for email
        required: true, // Makes it mandatory
        unique: true, 
    },
    height:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true,
        select: false,
    }
    ,
    weight:{
        type:Number,
        required:true
    },
    religion:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:['Male','Female','Other']
    },
    prefferedGender:{
        type:String,
        required:true,
        enum:['Male','Female','Other']
    },
    bio:{
        type:String,
        default:""
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User Schema"
    }],
    disLikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User Schema"
    }],
    matches:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User Schema"
    }]

},{timestamps:true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next(); // Skip hashing if the password is not modified
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

export const user=mongoose.model("User Schema",userSchema)
