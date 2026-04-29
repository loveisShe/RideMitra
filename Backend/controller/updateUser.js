import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Only allow users to update their own profile
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile" });
        }

        let updates = req.body;

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};