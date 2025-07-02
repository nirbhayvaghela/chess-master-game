import { Router } from "express";
import { logout, refreshAccessToken, signIn, signUp } from "../controllers/auth.controller";
import { validateData } from "../middlewares/validateRequest.middleware";
import { gameRoomSchema } from "../schemas/game-room.schema";
import { getRoomDetails, joinRoom } from "../controllers/game-room.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/create-room").post(validateData(gameRoomSchema), signUp);
router.route("/join-room").post(joinRoom);
router.route('/get-room-details').get(getRoomDetails); 

export default router;