import express from "express";
import { candidateInfoValidation, employerInfoValidation, loginValidation, registerValidation } from "./validator/userValidators";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUser } from "./userController/registerController";
import { loginUser } from "./userController/loginController";

import { authenticateJWT } from "../../middlewares/authMiddleware";
import { upload } from "../../middlewares/uploadMiddleware";

const userRouter = express.Router();

// Route for user registration with validation middleware
userRouter.post("/register", ...registerValidation, validateRequest, registerUser);

// Route for user login with validation middleware
userRouter.post("/login", ...loginValidation, validateRequest, loginUser);
export default userRouter;
