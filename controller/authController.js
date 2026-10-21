import User from "../models/userModels.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../lib/utils.js";


// ---------------------------------------------------------------------

// Controller for SignUp
export const signup = async (req, res) => {

        const {name, email, password, universityIdNumber} = req.body;
        const universityIdCard = req.file.path;        
    try {
        if (!name ||!email ||!password || !universityIdCard || !universityIdNumber) {
            return res.status(400).json({success: false, message: "Please fill all the fields"})
        }

        const existingUser = await User.findOne({
            $or: [{ email }, {universityIdNumber }]
        }); 

        if (existingUser) {
            return res.json({success: false, message: "Account already exist"});
        }

        // 👇 upload to Cloudinary FIRST, get back a URL
        const cloudinaryResult = await cloudinary.uploader.unsigned_upload(
        req.file.path,
        "uwjznmoi"
        );

        const newUser = await User.create({
        name,   
        email,
        password,
        universityIdNumber,
        universityIdCard: cloudinaryResult.secure_url, // 👈 here — string path, not the whole req.file object
        });

        return res.json({ success: true, message: "Account created successfully", user: newUser });


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }   
}

// ---------------------------------------------------------------------

// Controller for Login 
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user (password excluded by default, so explicitly select it)
    const userData = await User.findOne({ email }).select("+password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate token
    const token = generateAccessToken(userData._id);

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 5. Remove password before sending user data back
    userData.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      userData,
      message: "Login successful",
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


 // Controller to check if user is authenticated
    export const checkAuth = (req, res)=>{
        res.json({success: true, user: req.user});
    }

// ---------------------------------------------------------------------

// Controller for LogOut
export const logout = async (req, res) => {
  try {
    // Clear the cookie by setting maxAge to 0
      res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
    success: false,
    message: "Internal server error",
    });
  }
};