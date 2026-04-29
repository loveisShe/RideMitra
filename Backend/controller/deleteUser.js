import User from "../models/User.js";

export const deleteUser = async (req, res) => {
    try {
    const { id } = req.params;

        // ✅ Only allow users to delete their own account
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden: You can only delete your own account" });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};