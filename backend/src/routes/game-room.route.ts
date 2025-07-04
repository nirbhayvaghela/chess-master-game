import { Router } from "express";
import { validateData } from "../middlewares/validateRequest.middleware";
import { gameRoomSchema, joinRoomSchema } from "../schemas/game-room.schema";
import { createRoom, getRoomDetails, joinRoom, leaveRoom } from "../controllers/game-room.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route('/').get(getRoomDetails); 
router.route("/create-room").post(validateData(gameRoomSchema), createRoom);
router.route("/join-room").post(validateData(joinRoomSchema),joinRoom);
router.route('/leave-room').post(leaveRoom); 

export default router;