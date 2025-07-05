import { Router } from "express";
import { validateData } from "../middlewares/validateRequest.middleware";
import { gameRoomSchema } from "../schemas/game-room.schema";
import {
  createRoom,
  getRoomDetails,
} from "../controllers/game-room.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getRoomDetails);
router.route("/create-room").post(validateData(gameRoomSchema), createRoom);
// router.route("/join-room").post(validateData(joinRoomSchema),joinRoom);
// router.route('/remove-spectator').post(validateData(removeSpectatorSchema),removeSpectator);
// router.route('/leave-room').post(leaveRoom);

export default router;
