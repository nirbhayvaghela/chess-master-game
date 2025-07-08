export class SocketResponder {
    private socket: any;
  
    constructor(socket: any) {
      this.socket = socket;
    }
  
    success(event: string, payload: object = {}) {
      this.socket.emit(event, {
        type: "success",
        ...payload,
      });
    }
  
    error(event: string, message: string, code?: number) {
      this.socket.emit(event, {
        type: "error",
        message,
        code,
      });
    }
  
    // Optional: generic emit with type
    emit(event: string, payload: object, type: "success" | "error" = "success") {
      this.socket.emit(event, {
        type,
        ...payload,
      });
    }
  
    // Optional: to room
    static toRoom(io: any, roomId: number, event: string, payload: object, type: "success" | "error" = "success") {
      io.to(`room:${roomId}`).emit(event, {
        type,
        ...payload,
      });
    }
  }
  