import path from "path";
import { ChatHandler } from "./chat.interface";
import axios from "axios"; // Import axios for HTTP requests
import { ChangeEvent, useState } from "react";

export default function ChatSelect(
  props: Pick<ChatHandler, | "cachePath" | "setPath" | "messages" | "setMessages" >
) {

  const [file, setFile] = useState<File | null>(null);

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

      console.log("New chat created:", response.data);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleButtonClick = async (path: string) => {
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

    return (
      <div className="rounded-xl bg-white p-4 shadow-xl w-[25%] flex flex-col">
        Chat select
        
        <input name="file" type="file" onChange={handleFileChange}  />
        <button onClick={() => createNewChat()}>New Chat</button>
        <button onClick={() => handleButtonClick("/uber")}>Uber</button>
        <button onClick={() => handleButtonClick("/research_paper")}>Paper</button>
        <button onClick={() => console.log(props.messages)}>log current messages</button>
      </div> 
    )
}