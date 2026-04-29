import User from "../models/User.js";

export const getUserById = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;  // ✅ Fixed: was req.user.id (undefined)
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};