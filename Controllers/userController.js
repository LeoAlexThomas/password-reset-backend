import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../Utils/mailer.js";
import { frontendBaseUrl, getRandomNumber } from "../Utils/common.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking for existing user
    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({
        message: "User is already exist",
      });
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Creating new user
    const newUser = new User({ name, email, password: hashedPassword });
    // Saving user in db
    await newUser.save();
    res.status(200).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.response?.data?.message ??
        "Cannot create user, Error in creating user",
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // Checking user is available in db
    if (!user) {
      res.status(404).json({
        message: "User email not found",
      });
    }
    // Checking user password and stored password are same.
    const isValidPassword = await bcrypt.compare(password, user.password);
    // If password is incorrect
    if (!isValidPassword) {
      res.status(401).json({
        message: "Password is incorrect",
      });
    }

    // Generating jwt token with payload of userId adding secret to jwt token
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Storing the jwt token in user data
    user.token = jwtToken;

    await user.save();

    res.status(200).json({
      message: "User loggedIn successfully",
      data: {
        token: jwtToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot create user, Error in creating user",
    });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Checking user is available in db
    if (!user) {
      res.status(404).json({ message: "User email not found" });
    }

    // Generating random 4 digit number;
    const resetPin = getRandomNumber(1001, 9999);
    // Setting validity date for the pin
    const now = new Date();
    // Creating jwt token for user identification
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Storing pin, validity date and token to user info
    user.resetPin = resetPin;
    user.resetPinValidity = now.setHours(now.getHours() + 1);
    user.token = jwtToken;
    await user.save();

    // Sending reset link mail to user mail id
    await sendEmail(
      email,
      "Reset Password Pin",
      `Here is link for password reset ${frontendBaseUrl}/resetPassword?token=${jwtToken}&pin=${resetPin}, this link is valid upto 1 hour from mail received`
    );

    res.status(200).json({
      message: "mail sent to given mail address",
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot send mail, Error in sending mail",
    });
  }
};

export const verifyResetPin = async (req, res) => {
  try {
    const { pin, token } = req.body;
    // Verifying user token which is sent with reset link
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // Getting user info based on decoded user id
    const user = await User.findById(decoded.userId);
    // Getting current Date & time
    const now = new Date().getTime();
    // Getting validity date & time from user info
    const validityLimit = user.resetPinValidity?.getTime();
    // Checking is still pin is valid or not
    if ((!validityLimit && !user.resetPin) || validityLimit - now <= 0) {
      res.status(401).json({
        message: "Pin is expired, please get new link",
      });
      return;
    }
    // Checking user entered pin and stored pin
    if (pin !== user.resetPin) {
      res.status(401).json({
        message: "Pin is incorrect",
      });
      return;
    }
    // Resetting resetPin value and resetPinValidity value to null current pin i validated
    user.resetPin = null;
    user.resetPinValidity = null;
    await user.save();
    res.status(200).json({
      message: "Pin is verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot verify pin, Error in verifying pin",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    // Verifying user token which is sent with reset link
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // Getting user info based on decoded user id
    const user = await User.findById(decoded.userId);

    // Checking user is available in db
    if (!user) {
      res.status(401).json({
        message: "User not found, Please get new reset link",
      });
      return;
    }
    // Hashing the new password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Storing new hashed password to user info
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot change password, Error in changing password",
    });
  }
};
