import express, { Router } from "express";
import { chat } from "../controllers/chat.controller";
import { messageCache } from "../controllers/message-cache.controller"
import { createNewChat } from "../controllers/new-chat.controller";

const llmRouter: Router = express.Router();

llmRouter.route("/").post(chat);
llmRouter.route("/message-cache").get(messageCache);
llmRouter.route("/new-chat",).post(createNewChat);

export default llmRouter;
