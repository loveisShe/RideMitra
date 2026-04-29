import User from "../models/User.js";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sendTokenResponse = (user, statusCode, res, message) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false, 
        sameSite: "Lax",
        path: "/" 
    };

    res.status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            message,
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                phone: user.phone || "",
                city: user.city || "",
                bio: user.bio || ""
            },
        });
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all required fields: name, email, and password" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            userId: uuidv4(),
            name,
            email,
            password: hashedPassword,
            role: role || "Passenger"
        });

        sendTokenResponse(newUser, 201, res, "User registered successfully");

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide both email and password" 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        sendTokenResponse(user, 200, res, "Login successful");

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GOOGLE LOGIN =================
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "No Google token provided" });
        }

        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const userData = await googleRes.json();

        if (!userData.email) {
            console.error("Google Auth Error:", userData);
            return res.status(400).json({ success: false, message: "Google Authentication failed" });
        }

        const { name, email, picture } = userData;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                userId: uuidv4(),
                name,
                email,
                password: "",
                role: "Passenger",
                profilePicture: picture,
                phone: "",
                city: "",
                bio: ""
            });
        }


        sendTokenResponse(user, 200, res, "Login successful via Google");

    } catch (error) {
        console.error("CRITICAL GOOGLE LOGIN ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
