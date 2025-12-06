import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/dbConfig.js";
import AuthRoutes from "./Routes/userRoute.js";

// Dotenv config
dotenv.config();

const port = process.env.PORT;

const app = express();

// Default middleware
app.use(express.json());

app.use(cors());

// Connecting Database
connectDB();

// Default Route config
app.get("/", (req, res) => {
  res.status(200).json("Welcome to Password rest backend service");
});

app.use("/api/auth", AuthRoutes);

app.listen(port, () => {
  console.log("Server running in ", port);
});
