import express from "express";
import { signup, Login, logout } from "../controller/authController.js";
import upload from "../middleware/multerMiddleware.js";


const authRouter = express.Router();


authRouter.post("/signup", upload.single("universityIdCard"), signup)
authRouter.post("/login", Login)
authRouter.post("/logout", logout);


export default authRouter;