import { registerUserService, loginUserService, googleLoginService, getUserService, updateUserService, deleteUserService, sendTokenResponse } from "../services/userService.js";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
    try {
        const user = await registerUserService(req.body);
        sendTokenResponse(user, 201, res, "User registered successfully");
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
    try {
        const user = await loginUserService(req.body);
        sendTokenResponse(user, 200, res, "Login successful");
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
    try {
        const user = await googleLoginService(req.body.token);
        sendTokenResponse(user, 200, res, "Login successful via Google");
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

// ================= GET USER =================
export const getUserById = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const user = await getUserService(id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
    try {
        const user = await updateUserService(req.user._id, req.params.id, { ...req.body });
        res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
    try {
        await deleteUserService(req.user._id, req.params.id);
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};
