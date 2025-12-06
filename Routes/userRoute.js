import express from "express";
import {
  loginUser,
  registerUser,
  resetPassword,
  verifyResetPin,
} from "../Controllers/userController.js";
import { forgotPassword } from "../Controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Sending mail to user mail for reset link and pin for verification
router.post("/getResetLink", forgotPassword);
// Checking pin and stored pin in user info
router.post("/verifyResetPin", verifyResetPin);
// Change user password
router.put("/resetPassword", resetPassword);

export default router;
