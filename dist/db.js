"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = exports.Content = exports.Tag = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const contentTypes = ['image', 'video', 'article', 'audio'];
if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not defined");
}
mongoose_1.default.connect(process.env.MONGODB_URL).then(() => console.log("MongoDB connected"));
const userSchema = new mongoose_1.default.Schema({
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
exports.User = mongoose_1.default.model("User", userSchema);
const tagSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, unique: true },
});
exports.Tag = mongoose_1.default.model("Tag", tagSchema);
const contentSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    type: String,
    tags: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Tag",
        },
    ],
    link: { type: String, required: true },
    userId: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "User",
            required: true,
        },]
});
exports.Content = mongoose_1.default.model("Content", contentSchema);
const linkSchema = new mongoose_1.default.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true, unique: true },
});
exports.Link = mongoose_1.default.model("Link", linkSchema);
