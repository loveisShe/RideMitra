import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= SEND TOKEN RESPONSE =================
export const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/"
    };

    const userPayload = {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        profilePicture: user.profilePicture,
        phone:          user.phone || "",
        city:           user.city  || "",
        bio:            user.bio   || ""
    };

    res.status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({ success: true, message, token, user: userPayload });
};


// ================= REGISTER =================
export const registerUserService = async ({ name, email, password, role }) => {
    if (!name || !email || !password) {
        throw { status: 400, message: "Please provide name, email and password" };
    }

    const existing = await User.findOne({ email });
    if (existing) throw { status: 400, message: "User already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        userId: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: role || "Passenger"
    });

    return user;
};

// ================= LOGIN =================
export const loginUserService = async ({ email, password }) => {
    if (!email || !password) {
        throw { status: 400, message: "Please provide email and password" };
    }

    const user = await User.findOne({ email });
    if (!user) throw { status: 401, message: "Invalid email or password" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { status: 401, message: "Invalid email or password" };

    return user;
};

// ================= GOOGLE LOGIN =================
export const googleLoginService = async (token) => {
    if (!token) throw { status: 400, message: "No Google token provided" };

    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const userData = await googleRes.json();

    if (!userData.email) throw { status: 400, message: "Google Authentication failed" };

    const { name, email, picture } = userData;
    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            userId: uuidv4(),
            name,
            email,
            password: "",
            role: "Passenger",
            profilePicture: picture
        });
    }

    return user;
};

// ================= GET USER =================
export const getUserService = async (id) => {
    let user = await User.findById(id).select("-password").catch(() => null);

    if (!user) {
        user = await User.findOne({ userId: id }).select("-password");
    }

    if (!user) throw { status: 404, message: "User not found" };

    return user;
};

// ================= UPDATE USER =================
export const updateUserService = async (tokenId, urlId, updates) => {
    if (urlId && urlId.toString() !== tokenId.toString()) {
        throw { status: 403, message: "Forbidden: You can only update your own profile" };
    }

    delete updates.email;
    delete updates.role;

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    } else {
        delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
        tokenId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) throw { status: 404, message: "User not found" };

    return updatedUser;
};

// ================= DELETE USER =================
export const deleteUserService = async (tokenId, urlId) => {
    if (urlId && urlId.toString() !== tokenId.toString()) {
        throw { status: 403, message: "Forbidden: You can only delete your own account" };
    }

    const deleted = await User.findByIdAndDelete(tokenId);
    if (!deleted) throw { status: 404, message: "User not found" };

    return deleted;
};
