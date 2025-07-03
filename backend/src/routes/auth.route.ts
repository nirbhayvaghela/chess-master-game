import { Router } from "express";
import { logout, refreshAccessToken, signIn, signUp } from "../controllers/auth.controller";
import { validateData } from "../middlewares/validateRequest.middleware";
import { signInSchema, signUpSchema } from "../schemas/auth.schema";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signup").post(validateData(signUpSchema), signUp);
router.route("/signIn").post(validateData(signInSchema), signIn);
router.route("/logout").post(verifyJWT,logout);
router.route('/refresh-token').post(verifyJWT, refreshAccessToken); 

export default router;