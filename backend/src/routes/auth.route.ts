import { Router } from "express";
import { signUp } from "../controllers/auth.controller";
import { validateData } from "../middlewares/validateRequest.middleware";
import { signUpSchema } from "../utils/validators/auth.schema";

const router = Router();

router.route("/signup").post(validateData(signUpSchema), signUp);