import express from "express"
import { checkAuth } from '../middleware/checkAuth.js';
import { login, logout } from "../controller/authController.js";

const authRouter = express.Router()

authRouter.post('/login', login);
authRouter.post('/logout', checkAuth, logout);

export default authRouter