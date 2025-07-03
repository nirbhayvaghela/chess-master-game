import { Router } from "express";
import { validateData } from "../middlewares/validateRequest.middleware";
import { gameRoomSchema } from "../schemas/game-room.schema";
import { createRoom, getRoomDetails, joinRoom } from "../controllers/game-room.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/create-room").post(validateData(gameRoomSchema), createRoom);
router.route("/join-room").post(joinRoom);
router.route('/get-room-details').get(getRoomDetails); 

export default router;