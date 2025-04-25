import express from "express";
import jwt from "jsonwebtoken";
import { Content, Link, User } from "./db";
import cors from "cors";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import z from "zod";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const signupSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

const signinSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

app.get("/", (req, res) => {
  res.send("hi");
});
app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;

  const parsedInput = signupSchema.safeParse({ username, password });

  if (!parsedInput.success) {
    res.status(411).json({ message: "Incorrect inputs" });
    return;
  }

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

  const parsedInput = signinSchema.safeParse({ username, password });

  if (!parsedInput.success) {
    res.status(411).json({ message: "Incorrect inputs" });
    return;
  }

  const existingUser = await User.findOne({ username, password });

  if (existingUser) {
    //@ts-ignore
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(403).json({ message: "Inccorect credentials" });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, title, type } = req.body;

  await Content.create({
    title,
    link,
    //@ts-ignore
    userId: req.userId,
    tags: [],
    type,
  });
  res.json({ message: "Content added successfully" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const content = await Content.find({
    userId: userId,
  }).populate("userId", "username"); //populate the userId with the information of the user

  res.json({ content });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  //@ts-ignore
  await Content.deleteMany({ contentId, userId: req.userId });

  res.json({ message: "Content deleted successfully" });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body;
  if (share) {
    //@ts-ignore
    const existingLink = await Link.findOne({ userId: req.userId });
    if (existingLink) {
      res.json({ hash: existingLink.hash });
      return;
    }
    const hash = random(10);
    //@ts-ignore
    await Link.create({ userId: req.userId, hash });
    res.json({ hash });
  } else {
    //@ts-ignore
    await Link.deleteMany({ userId: req.userId });
    res.json({ message: "Removed Link" });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await Link.findOne({ hash });
  if (!link) {
    res.status(404).json({ message: "Link not found" });
    return;
  }
  const content = await Content.find({ userId: link.userId });
  const user = await User.findOne({ _id: link.userId });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ username: user.username, content });
});

app.listen(8001, () => console.log("Server Started"));
