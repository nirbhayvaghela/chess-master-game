
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile } from "lucide-react";

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export function ChatPanel() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: "System",
      content: "Game started! Good luck to both players.",
      timestamp: "14:30",
      isSystem: true
    },
    {
      id: 2,
      user: "Alice",
      content: "Good luck! Let's have a great game.",
      timestamp: "14:31"
    },
    {
      id: 3,
      user: "Bob",
      content: "Thanks! May the best player win.",
      timestamp: "14:31"
    },
    {
      id: 4,
      user: "Charlie",
      content: "Nice opening move!",
      timestamp: "14:35"
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      user: "You",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-2 rounded text-sm ${
                  msg.isSystem 
                    ? 'bg-primary/10 text-primary text-center italic' 
                    : 'bg-secondary/50'
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-primary">{msg.user}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                )}
                <div className={msg.isSystem ? '' : 'text-foreground'}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => console.log('Emoji picker')}
            >
              <Smile className="h-4 w-4" />
            </Button>
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
