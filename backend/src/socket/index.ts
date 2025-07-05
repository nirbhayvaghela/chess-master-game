import { Server, Socket } from "socket.io";
import { joinRoomHandler } from "./Handlers/joinRoom.handler";
import { LeftRoomHandler } from "./Handlers/leftRoom.handler";
import { removeSpectatorHandler } from "./Handlers/removeSpecator.handler";
import { moveHandler } from "./Handlers/move.handler";

const socketHandler = (io: Server) => {
    io.on('connection', (socket: Socket) => {  console.log(`Connected: ${socket.id}`);
        
        joinRoomHandler(io, socket);
        LeftRoomHandler(io, socket);
        removeSpectatorHandler(io, socket);
        moveHandler(io, socket);
        // chatHandlers(io, socket);
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
