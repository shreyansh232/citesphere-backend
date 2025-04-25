"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
// import { JWT_SECRET } from "./config";
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const zod_1 = __importDefault(require("zod"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
const signupSchema = zod_1.default.object({
    username: zod_1.default.string().min(3).max(30),
    password: zod_1.default.string().min(6),
});
const signinSchema = zod_1.default.object({
    username: zod_1.default.string().min(3).max(30),
    password: zod_1.default.string().min(6),
});
app.get("/", (req, res) => {
    res.send("hi");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const parsedInput = signupSchema.safeParse({ username, password });
    if (!parsedInput.success) {
        res.status(411).json({ message: "Incorrect inputs" });
        return;
    }
    //Use a try-catch block if something can fail
    try {
        yield db_1.User.create({
            username,
            password,
        });
        res.json({ message: "User signed up" });
    }
    catch (error) {
        res.status(411).json({ message: "User already exists" });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const parsedInput = signinSchema.safeParse({ username, password });
    if (!parsedInput.success) {
        res.status(411).json({ message: "Incorrect inputs" });
        return;
    }
    const existingUser = yield db_1.User.findOne({ username, password });
    if (existingUser) {
        //@ts-ignore
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        res.json({ token });
    }
    else {
        res.status(403).json({ message: "Inccorect credentials" });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, title, type } = req.body;
    yield db_1.Content.create({
        title,
        link,
        //@ts-ignore
        userId: req.userId,
        tags: [],
        type,
    });
    res.json({ message: "Content added successfully" });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.Content.find({
        userId: userId,
    }).populate("userId", "username"); //populate the userId with the information of the user
    res.json({ content });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    //@ts-ignore
    yield db_1.Content.deleteMany({ contentId, userId: req.userId });
    res.json({ message: "Content deleted successfully" });
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        //@ts-ignore
        const existingLink = yield db_1.Link.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }
        const hash = (0, utils_1.random)(10);
        //@ts-ignore
        yield db_1.Link.create({ userId: req.userId, hash });
        res.json({ hash });
    }
    else {
        //@ts-ignore
        yield db_1.Link.deleteMany({ userId: req.userId });
        res.json({ message: "Removed Link" });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.Link.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Link not found" });
        return;
    }
    const content = yield db_1.Content.find({ userId: link.userId });
    const user = yield db_1.User.findOne({ _id: link.userId });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ username: user.username, content });
}));
app.listen(8001, () => console.log("Server Started"));
