"use client";

import { useChat } from "ai/react";
import { ChatInput, ChatMessages, ChatSelect } from "./ui/chat";
import { useState } from "react";

export default function ChatSection() {
  const {
    messages,
    setMessages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
  } = useChat({
    api: process.env.NEXT_PUBLIC_CHAT_API,
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    onError: (error) => {
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
  });

  const [path, setPath] = useState("");

  
  return (
    <div className="space-y-3 max-w-5xl w-full h-full items-center my-auto">
      <div className="space-x-3 flex flex-row h-[80vh]" > 
        <ChatSelect
          messages={messages}
          setMessages={setMessages}
          cachePath={path}
          setPath={setPath}
        />
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          reload={reload}
          stop={stop}
        />          
      </div>
      <ChatInput
          input={input}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
          multiModal={true}
          cachePath={path}
        />
    </div>
  );
}
