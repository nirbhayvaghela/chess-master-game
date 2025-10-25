import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getDashboardDetails } from "../controllers/dashboard.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getDashboardDetails);

export default router;
