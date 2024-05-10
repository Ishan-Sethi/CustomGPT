import { Request, Response } from "express";
import path from "path";


export const messageCache = async (req: Request, res: Response) => {
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
