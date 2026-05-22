import prisma from "../Lib/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= SEND TOKEN RESPONSE =================
export const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user.id);

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/"
    };

    const userPayload = {
        id:             user.id,
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
    if (password.length < 6) {
        throw { status: 400, message: "Password must be at least 6 characters" };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: "User already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || "Passenger"
        }
    });

    return user;
};

// ================= LOGIN =================
export const loginUserService = async ({ email, password }) => {
    if (!email || !password) {
        throw { status: 400, message: "Please provide email and password" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: "Invalid email or password" };

    const isMatch = await bcrypt.compare(password, user.password || "");
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

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name,
                email,
                password: "",
                role: "Passenger",
                profilePicture: picture
            }
        });
    }

    return user;
};

// ================= GET USER =================
export const getUserService = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid user ID" };

    const user = await prisma.user.findUnique({
        where: { id: numericId },
        select: {
            id: true, name: true, email: true, phone: true,
            city: true, bio: true, role: true, profilePicture: true, createdAt: true
        }
    });

    if (!user) throw { status: 404, message: "User not found" };
    return user;
};

// ================= UPDATE USER =================
export const updateUserService = async (tokenId, urlId, updates) => {
    if (urlId && parseInt(urlId) !== parseInt(tokenId)) {
        throw { status: 403, message: "Forbidden: You can only update your own profile" };
    }

    delete updates.email;
    delete updates.role;

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    } else {
        delete updates.password;
    }

    const updatedUser = await prisma.user.update({
        where: { id: parseInt(tokenId) },
        data: updates,
        select: {
            id: true, name: true, email: true, phone: true,
            city: true, bio: true, role: true, profilePicture: true
        }
    });

    return updatedUser;
};

// ================= DELETE USER =================
export const deleteUserService = async (tokenId, urlId) => {
    if (urlId && parseInt(urlId) !== parseInt(tokenId)) {
        throw { status: 403, message: "Forbidden: You can only delete your own account" };
    }

    const deleted = await prisma.user.delete({ where: { id: parseInt(tokenId) } });
    if (!deleted) throw { status: 404, message: "User not found" };
    return deleted;
};
