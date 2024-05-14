import path from "path";
import { ChatHandler } from "./chat.interface";
import axios from "axios"; // Import axios for HTTP requests
import { ChangeEvent, useState, useEffect } from "react";

export default function ChatSelect(
  props: Pick<ChatHandler, | "cachePath" | "setPath" | "messages" | "setMessages" | "isLoading">
) {

  const [file, setFile] = useState<File | null>(null);
  const [chatData, setChatData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/chat/get-chats/');
        setChatData(response.data); // Update state with fetched data
        if (response.data[0]) {
          console.log(response.data[0]);
          handleChatSwitch(response.data[0].cachePath);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sendMessages = async () => {
      console.log("sending message history");
      try {
        const response = await axios.post(`http://localhost:8000/api/chat/set-message-cache/`, {cachePath: props.cachePath, messages: props.messages});
      } catch (error) {
        console.error("Error fetching cached message:", error);
      }
    };
    if(!props.isLoading) {      
      sendMessages();
    }
  }, [props.isLoading]);

  const createNewChat = async() => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log(formData);
      // Make a POST request to backend API
      const response = await axios.post<any>(
        "http://localhost:8000/api/chat/new-chat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setChatData(response.data);
      props.setPath(response.data.slice(-1)[0].cachePath);
      props.setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleChatSwitch = async (path: string) => {
    props.setPath(path); // Set the cachePath in your parent component

    // Getting the chat history
    try {
      // Make a GET request to backend API
      const response = await axios.get(`http://localhost:8000/api/chat/message-cache/`, {
        params: {
          cachePath: path, // Pass the cachePath as a query parameter
        },
      });
      props.setMessages(response.data);
      console.log(response.data); // Log the response data
    } catch (error) {
      console.error("Error fetching cached message:", error);
    }
  };

  const chatList = chatData.map((chatItem: any) => {
    return (
      <button onClick={() => handleChatSwitch(chatItem.cachePath)} key={chatItem.key}>{chatItem.chatName}</button>
    );    
  });

    return (
      <div className="rounded-xl bg-white p-4 shadow-xl w-[25%] flex flex-col">
        Chat select
        
        <input name="file" type="file" onChange={handleFileChange}  />
        <button onClick={() => createNewChat()}>New Chat</button>
        {chatList}
      </div> 
    )
}