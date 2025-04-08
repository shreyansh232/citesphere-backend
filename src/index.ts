import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Content, User } from "./db";
import { JWT_SECRET } from "./config";
import cors from "cors";
import { userMiddleware } from "./middleware";

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies.
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;

  //Use a try-catch block if something can fail
  try {
    await User.create({
      username,
      password,
    });
    res.json({ message: "User signed up" });
  } catch (error) {
    res.status(411).json({ message: "User already exists" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username, password });

  if (existingUser) {
    const token = jwt.sign({ id: existingUser._id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(403).json({ message: "Inccorect credentials" });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, title } = req.body;

  await Content.create({
    title,
    link,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });
  res.json({ message: "Content added successfully" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const content = await Content.find({
    userId: userId,
  });

  res.json({ content });
});
app.listen(8001, () => console.log("Server Started"));
