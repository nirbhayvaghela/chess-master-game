/* eslint-disable @typescript-eslint/no-explicit-any */
// useSocketEvent.ts
import { useEffect } from "react";
import socket from "@/lib/socket";

export function useSocketEvent<T = any>(event: string, handler: (data: T) => void) {
  useEffect(() => {
    socket.on(event, handler);

    return () => {
      socket.off(event, handler); // remove specific handler
    };
  }, [event, handler]);
}
