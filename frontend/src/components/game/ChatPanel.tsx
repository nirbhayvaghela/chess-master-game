/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile } from "lucide-react";
import socket from "@/lib/socket";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useChessGameStore } from "@/store";
import dayjs from "dayjs";

export function ChatPanel({ roomDetails }: { roomDetails: any }) {
  const [message, setMessage] = useState("");
  const { messages, addMessage } = useChessGameStore();
  const userData = LocalStorageGetItem("userData");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId: roomDetails.id,
      message: message,
      senderId: userData.id,
      username: userData.username,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useSocketEvent("receive-chat-message", (res) => {
    addMessage(res.message);
    setMessage("");
  });

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Chat</CardTitle>
      </CardHeader>

      <CardContent className="h-[30vh] flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4 [overflow-anchor:none]">
          <div className="space-y-2 pb-4">
            {messages.map((msg, index) => {
              const { sender, message, timestamp } = msg;
              
              return (
                <div
                  key={index}
                  className="bg-secondary/50 p-2 rounded text-sm text-foreground"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-primary">
                      {sender.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dayjs(timestamp).format("hh:mm A")}
                    </span>
                  </div>
                  <div>{message}</div>
                </div>
              );
            })}
            {/* Invisible div to scroll to */}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => console.log("Emoji picker")}
            >
              <Smile className="h-4 w-4" />
            </Button> */}
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
