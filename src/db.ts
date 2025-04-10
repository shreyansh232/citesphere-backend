import mongoose, { model, mongo, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const contentTypes = ['image', 'video', 'article', 'audio']; 

if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

mongoose.connect(process.env.MONGODB_URL as string).then(() => console.log("MongoDB connected"));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});


export const User = mongoose.model("User", userSchema);

const tagSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
});

export const Tag = mongoose.model("Tag", tagSchema);

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: String,
  tags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Tag",
    },
  ],
  link: { type: String, required: true },
  userId: [{
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },]
});

export const Content = mongoose.model("Content", contentSchema);


const linkSchema = new mongoose.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
  });

export const Link = mongoose.model("Link", linkSchema);