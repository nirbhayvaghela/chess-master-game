import { Router } from "express";
import {
  logout,
  signIn,
  signUp,
} from "../controllers/auth.controller";
import { validateData } from "../middlewares/validateRequest.middleware";
import {
  logoutSchema,
  signInSchema,
  signUpSchema,
} from "../schemas/auth.schema";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signup").post(validateData(signUpSchema), signUp);
router.route("/signIn").post(validateData(signInSchema), signIn);
router.route("/logout").post(validateData(logoutSchema), verifyJWT, logout);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/verify-token").get(verifyJWT, verifiyToken);

export default router;
