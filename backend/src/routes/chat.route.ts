import express, { Router } from "express";
import { chat } from "../controllers/chat.controller";
import { fetchChats, getMessageCache, setMessagesCache } from "../controllers/message-cache.controller"
import { createNewChat } from "../controllers/new-chat.controller";

const llmRouter: Router = express.Router();

llmRouter.route("/").post(chat);
llmRouter.route("/message-cache").get(getMessageCache);
llmRouter.route("/set-message-cache").post(setMessagesCache);
llmRouter.route("/new-chat",).post(createNewChat);
llmRouter.route("/get-chats").get(fetchChats);

export default llmRouter;
