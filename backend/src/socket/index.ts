import { Server, Socket } from "socket.io";
import { joinRoomHandler } from "./Handlers/joinRoom.handler";
import { removeSpectatorHandler } from "./Handlers/removeSpecator.handler";
import { moveHandler } from "./Handlers/move.handler";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { chatHandler } from "./Handlers/chat.handler";
import { validateRoomHandler } from "./Handlers/validate-room";
import { LeaveRoomHandler } from "./Handlers/leaveRoom.handler";

export interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}

const socketHandler = (io: Server) => {
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            // Get token from handshake auth or query
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
            
            const user = await db.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user) {
                return next(new Error('User not found'));
            }

            // Attach user info to socket
            socket.userId = decoded.id;
            socket.user = user;

            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });


    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`Connected: ${socket.id}`);

        validateRoomHandler(io, socket);
        joinRoomHandler(io, socket);
        LeaveRoomHandler(io, socket);
        removeSpectatorHandler(io, socket);
        moveHandler(io, socket);
        chatHandler(io, socket);
        // gameHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
};

export default socketHandler;


// client recive events
// join-room--> specator,
// recveive-move --> history, move, captured, fen
// chat-message --> message, sender, roomId
