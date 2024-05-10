import { Request, Response } from "express";

import path from "path";
import fs from "fs";
import { generateDatasource } from "./engine/generate";
import { setCachePath } from "./engine/shared";
import { initSettings } from "./engine/settings";

export const createNewChat = async (req: Request, res: Response) => {
  try {
    initSettings();
      const uploadedFile: any = req.files.file;
      console.log(uploadedFile);
      const baseURL = path.resolve(path.dirname(''));

      const cacheDir = path.join(baseURL, "cache");
      const directoryName = uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[\s.]+/g, "");
      const newFolderPath = path.join(cacheDir, directoryName);
      console.log(newFolderPath);
      fs.mkdirSync(newFolderPath);
      const newFolderDataPath = path.join(newFolderPath, "data");
      fs.mkdirSync(newFolderDataPath);
      uploadedFile.mv(path.join(newFolderDataPath, uploadedFile.name));
      setCachePath(directoryName);
      await (generateDatasource(newFolderDataPath, newFolderPath)).then(() => {
        const oldChats = fs.readFileSync(path.join(cacheDir, "chats.json"));
        let newChats = JSON.parse(oldChats);
        newChats.push({
            id: newChats.length,
            chatName: uploadedFile.name,
            cachePath: `/${directoryName}`
        })
        fs.writeFileSync(path.join(cacheDir, "chats.json"), JSON.stringify(newChats));
        res.status(200).send("File uploaded");
      });
    } catch (error) {
      console.error("Error creating new chat:", error);
      res.status(500).send("Error creating new chat.");
      throw error;
    }
};
