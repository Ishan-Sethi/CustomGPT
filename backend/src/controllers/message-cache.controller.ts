import { Request, Response } from "express";
import path from "path";
import fs from "fs";


export const getMessageCache = async (req: Request, res: Response) => {
  try {
    console.log(req.query.cachePath);
    
    // @ts-expect-error
    const cachePath: string = req.query.cachePath; 
    
    const baseURL = path.resolve(path.dirname(''));
    const filePath = path.join(baseURL, 'cache', cachePath, 'messages.json');
    console.log(baseURL);
    console.log(filePath);

    // Send the file using res.sendFile
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: (error as Error).message,
    });
  }
};

export const setMessagesCache = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const cachePath = req.body.cachePath;
    const messages = req.body.messages;
    const baseURL = path.resolve(path.dirname(''));
    const filePath = path.join(baseURL, 'cache', cachePath, 'messages.json');
    fs.writeFileSync(filePath, JSON.stringify(messages));
    res.status(200).send("Message History Saved");
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: (error as Error).message,
    });
  }
}


export const fetchChats = async (req: Request, res: Response) => {
  try {
    const baseURL = path.resolve(path.dirname(''));
    const chatsDirectory = path.join(baseURL, "cache", "chats.json");
    const chats = fs.readFileSync(chatsDirectory);
    // @ts-expect-error
    res.status(200).send(JSON.parse(chats));
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: (error as Error).message,
    });
  }
};