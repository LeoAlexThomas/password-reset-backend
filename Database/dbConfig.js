import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error in Connecting DB", error);
  }
};

export default connectDB;
