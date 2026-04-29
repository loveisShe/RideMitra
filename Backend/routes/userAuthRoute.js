import express from "express"; 

import { registerUser, loginUser, googleLogin } from "../controller/userController.js"; 
import { getUserById } from "../controller/getUser.js"; 
import { updateUser } from "../controller/updateUser.js"; 
import { deleteUser } from "../controller/deleteUser.js"; 
import { authMiddleware } from "../middlewares/authMiddleware.js"; 


const router = express.Router(); 

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

router.get("/me", authMiddleware, getUserById);
router.get("/get-user/:id", authMiddleware, getUserById);
router.put("/update-profile/:id", authMiddleware, updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);


export default router;