var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
import cors from "cors";
import "dotenv/config";
import express2 from "express";

// src/observability/index.ts
var initObservability = () => {
};

// src/routes/chat.route.ts
import express from "express";

// src/controllers/chat.controller.ts
import { StreamData as StreamData2, streamToResponse } from "ai";
import {
  CallbackManager,
  Settings as Settings2
} from "llamaindex";

// src/controllers/engine/chat.ts
import { ContextChatEngine, Settings } from "llamaindex";

// src/controllers/engine/index.ts
import { VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";

// src/controllers/engine/shared.ts
var STORAGE_CACHE_DIR = "./cache";
function setCachePath(path3) {
  STORAGE_CACHE_DIR = "./cache" + path3;
}

// src/controllers/engine/index.ts
function getDataSource() {
  return __async(this, null, function* () {
    const storageContext = yield storageContextFromDefaults({
      persistDir: `${STORAGE_CACHE_DIR}`
    });
    const numberOfDocs = Object.keys(
      storageContext.docStore.toDict()
    ).length;
    if (numberOfDocs === 0) {
      return null;
    }
    return yield VectorStoreIndex.init({
      storageContext
    });
  });
}

// src/controllers/engine/chat.ts
function createChatEngine() {
  return __async(this, null, function* () {
    const index = yield getDataSource();
    if (!index) {
      throw new Error(
        `StorageContext is empty - call 'npm run generate' to generate the storage first`
      );
    }
    const retriever = index.asRetriever();
    retriever.similarityTopK = process.env.TOP_K ? parseInt(process.env.TOP_K) : 3;
    return new ContextChatEngine({
      chatModel: Settings.llm,
      retriever
    });
  });
}

// src/controllers/llamaindex-stream.ts
import {
  createCallbacksTransformer,
  createStreamDataTransformer,
  trimStartOfStreamHelper
} from "ai";
import {
  Response
} from "llamaindex";

// src/controllers/stream-helper.ts
function appendImageData(data, imageUrl) {
  if (!imageUrl)
    return;
  data.appendMessageAnnotation({
    type: "image",
    data: {
      url: imageUrl
    }
  });
}
function appendSourceData(data, sourceNodes) {
  if (!(sourceNodes == null ? void 0 : sourceNodes.length))
    return;
  data.appendMessageAnnotation({
    type: "sources",
    data: {
      nodes: sourceNodes.map((node) => {
        var _a;
        return __spreadProps(__spreadValues({}, node.node.toMutableJSON()), {
          id: node.node.id_,
          score: (_a = node.score) != null ? _a : null
        });
      })
    }
  });
}
function appendEventData(data, title) {
  if (!title)
    return;
  data.appendMessageAnnotation({
    type: "events",
    data: {
      title
    }
  });
}

// src/controllers/llamaindex-stream.ts
function createParser(res, data, opts) {
  const it = res[Symbol.asyncIterator]();
  const trimStartOfStream = trimStartOfStreamHelper();
  let sourceNodes;
  return new ReadableStream({
    start() {
      appendImageData(data, opts == null ? void 0 : opts.image_url);
    },
    pull(controller) {
      return __async(this, null, function* () {
        var _a2;
        const { value, done } = yield it.next();
        if (done) {
          if (sourceNodes) {
            appendSourceData(data, sourceNodes);
          }
          controller.close();
          data.close();
          return;
        }
        let delta;
        if (value instanceof Response) {
          if (value.sourceNodes) {
            sourceNodes = value.sourceNodes;
          }
          delta = (_a2 = value.response) != null ? _a2 : "";
        } else {
          delta = value.response.delta;
        }
        const text = trimStartOfStream(delta != null ? delta : "");
        if (text) {
          controller.enqueue(text);
        }
      });
    }
  });
}
function LlamaIndexStream(response, data, opts) {
  return createParser(response, data, opts == null ? void 0 : opts.parserOptions).pipeThrough(createCallbacksTransformer(opts == null ? void 0 : opts.callbacks)).pipeThrough(createStreamDataTransformer());
}

// src/controllers/chat.controller.ts
var convertMessageContent = (textMessage, imageUrl) => {
  if (!imageUrl)
    return textMessage;
  return [
    {
      type: "text",
      text: textMessage
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl
      }
    }
  ];
};
var chat = (req, res) => __async(void 0, null, function* () {
  try {
    const { messages, data } = req.body;
    const cachePath = data["cachePath"];
    console.log(messages);
    console.log(cachePath);
    setCachePath(cachePath);
    console.log(STORAGE_CACHE_DIR);
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return res.status(400).json({
        error: "messages are required in the request body and the last message must be from the user"
      });
    }
    const chatEngine = yield createChatEngine();
    const userMessageContent = convertMessageContent(
      userMessage.content,
      data == null ? void 0 : data.imageUrl
    );
    const vercelStreamData = new StreamData2();
    const callbackManager = new CallbackManager();
    callbackManager.on("retrieve", (data2) => {
      const { nodes } = data2.detail;
      appendEventData(
        vercelStreamData,
        `Retrieving context for query: '${userMessage.content}'`
      );
      appendEventData(
        vercelStreamData,
        `Retrieved ${nodes.length} sources to use as context for the query`
      );
    });
    const response = yield Settings2.withCallbackManager(callbackManager, () => {
      return chatEngine.chat({
        message: userMessageContent,
        chatHistory: messages,
        stream: true
      });
    });
    const stream = LlamaIndexStream(response, vercelStreamData, {
      parserOptions: {
        image_url: data == null ? void 0 : data.imageUrl
      }
    });
    const processedStream = stream.pipeThrough(vercelStreamData.stream);
    return streamToResponse(processedStream, res);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return res.status(500).json({
      detail: error.message
    });
  }
});

// src/controllers/message-cache.controller.ts
import path from "path";
import fs from "fs";
var getMessageCache = (req, res) => __async(void 0, null, function* () {
  try {
    console.log(req.query.cachePath);
    const cachePath = req.query.cachePath;
    const baseURL = path.resolve(path.dirname(""));
    const filePath = path.join(baseURL, "cache", cachePath, "messages.json");
    console.log(baseURL);
    console.log(filePath);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: error.message
    });
  }
});
var setMessagesCache = (req, res) => __async(void 0, null, function* () {
  try {
    console.log(req.body);
    const cachePath = req.body.cachePath;
    const messages = req.body.messages;
    const baseURL = path.resolve(path.dirname(""));
    const filePath = path.join(baseURL, "cache", cachePath, "messages.json");
    fs.writeFileSync(filePath, JSON.stringify(messages));
    res.status(200).send("Message History Saved");
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: error.message
    });
  }
});
var fetchChats = (req, res) => __async(void 0, null, function* () {
  try {
    const baseURL = path.resolve(path.dirname(""));
    const chatsDirectory = path.join(baseURL, "cache", "chats.json");
    const chats = fs.readFileSync(chatsDirectory);
    res.status(200).send(JSON.parse(chats));
  } catch (error) {
    console.error("[Message Cache]", error);
    return res.status(500).json({
      detail: error.message
    });
  }
});

// src/controllers/new-chat.controller.ts
import path2 from "path";
import fs2 from "fs";

// src/controllers/engine/generate.ts
import { VectorStoreIndex as VectorStoreIndex2 } from "llamaindex";
import { storageContextFromDefaults as storageContextFromDefaults2 } from "llamaindex/storage/StorageContext";
import * as dotenv from "dotenv";

// src/controllers/engine/loader.ts
import { SimpleDirectoryReader } from "llamaindex";
function getDocuments(dataDirectory) {
  return __async(this, null, function* () {
    return yield new SimpleDirectoryReader().loadData({
      directoryPath: dataDirectory
    });
  });
}

// src/controllers/engine/generate.ts
dotenv.config();
function getRuntime(func) {
  return __async(this, null, function* () {
    const start = Date.now();
    yield func();
    const end = Date.now();
    return end - start;
  });
}
function generateDatasource(dataDirectory, outputDirectory) {
  return __async(this, null, function* () {
    console.log(`Generating storage context...`);
    const ms = yield getRuntime(() => __async(this, null, function* () {
      const storageContext = yield storageContextFromDefaults2({
        persistDir: outputDirectory
      });
      const documents = yield getDocuments(dataDirectory);
      console.log(documents);
      yield VectorStoreIndex2.fromDocuments(documents, {
        storageContext
      });
      console.log("Generated Vector store");
    }));
    console.log(`Storage context successfully generated in ${ms / 1e3}s.`);
    return true;
  });
}

// src/controllers/engine/settings.ts
import {
  Anthropic,
  Gemini,
  GeminiEmbedding,
  OpenAI,
  OpenAIEmbedding,
  Settings as Settings3
} from "llamaindex";
import { HuggingFaceEmbedding } from "llamaindex/embeddings/HuggingFaceEmbedding";
import { OllamaEmbedding } from "llamaindex/embeddings/OllamaEmbedding";
import { Ollama } from "llamaindex/llm/ollama";
var CHUNK_SIZE = 512;
var CHUNK_OVERLAP = 20;
var initSettings = () => __async(void 0, null, function* () {
  console.log(`Using '${process.env.MODEL_PROVIDER}' model provider`);
  if (!process.env.MODEL || !process.env.EMBEDDING_MODEL) {
    throw new Error("'MODEL' and 'EMBEDDING_MODEL' env variables must be set.");
  }
  switch (process.env.MODEL_PROVIDER) {
    case "ollama":
      initOllama();
      break;
    case "anthropic":
      initAnthropic();
      break;
    case "gemini":
      initGemini();
      break;
    default:
      initOpenAI();
      break;
  }
  Settings3.chunkSize = CHUNK_SIZE;
  Settings3.chunkOverlap = CHUNK_OVERLAP;
});
function initOpenAI() {
  var _a;
  Settings3.llm = new OpenAI({
    model: (_a = process.env.MODEL) != null ? _a : "gpt-3.5-turbo",
    maxTokens: 512
  });
  Settings3.embedModel = new OpenAIEmbedding({
    model: process.env.EMBEDDING_MODEL,
    dimensions: process.env.EMBEDDING_DIM ? parseInt(process.env.EMBEDDING_DIM) : void 0
  });
}
function initOllama() {
  var _a, _b;
  Settings3.llm = new Ollama({
    model: (_a = process.env.MODEL) != null ? _a : ""
  });
  Settings3.embedModel = new OllamaEmbedding({
    model: (_b = process.env.EMBEDDING_MODEL) != null ? _b : ""
  });
}
function initAnthropic() {
  const embedModelMap = {
    "all-MiniLM-L6-v2": "Xenova/all-MiniLM-L6-v2",
    "all-mpnet-base-v2": "Xenova/all-mpnet-base-v2"
  };
  Settings3.llm = new Anthropic({
    model: process.env.MODEL
  });
  Settings3.embedModel = new HuggingFaceEmbedding({
    modelType: embedModelMap[process.env.EMBEDDING_MODEL]
  });
}
function initGemini() {
  Settings3.llm = new Gemini({
    model: process.env.MODEL
  });
  Settings3.embedModel = new GeminiEmbedding({
    model: process.env.EMBEDDING_MODEL
  });
}

// src/controllers/new-chat.controller.ts
var createNewChat = (req, res) => __async(void 0, null, function* () {
  try {
    initSettings();
    const uploadedFile = req.files.file;
    console.log(uploadedFile);
    const baseURL = path2.resolve(path2.dirname(""));
    const cacheDir = path2.join(baseURL, "cache");
    const directoryName = uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[\s.]+/g, "") + (/* @__PURE__ */ new Date()).getTime();
    const newFolderPath = path2.join(cacheDir, directoryName);
    console.log(newFolderPath);
    fs2.mkdirSync(newFolderPath);
    const newFolderDataPath = path2.join(newFolderPath, "data");
    fs2.mkdirSync(newFolderDataPath);
    uploadedFile.mv(path2.join(newFolderDataPath, uploadedFile.name));
    setCachePath(directoryName);
    yield generateDatasource(newFolderDataPath, newFolderPath).then(() => {
      const oldChats = fs2.readFileSync(path2.join(cacheDir, "chats.json"));
      let newChats = JSON.parse(oldChats);
      newChats.push({
        key: directoryName,
        chatName: uploadedFile.name,
        cachePath: `/${directoryName}`
      });
      fs2.writeFileSync(path2.join(cacheDir, "chats.json"), JSON.stringify(newChats));
      fs2.writeFileSync(path2.join(newFolderPath, "messages.json"), "[]");
      res.status(200).send(newChats);
    });
  } catch (error) {
    console.error("Error creating new chat:", error);
    res.status(500).send("Error creating new chat.");
    throw error;
  }
});

// src/routes/chat.route.ts
var llmRouter = express.Router();
llmRouter.route("/").post(chat);
llmRouter.route("/message-cache").get(getMessageCache);
llmRouter.route("/set-message-cache").post(setMessagesCache);
llmRouter.route("/new-chat").post(createNewChat);
llmRouter.route("/get-chats").get(fetchChats);
var chat_route_default = llmRouter;

// index.ts
import fileUpload from "express-fileupload";
var app = express2();
var port = parseInt(process.env.PORT || "8000");
var env = process.env["NODE_ENV"];
var isDevelopment = !env || env === "development";
var prodCorsOrigin = process.env["PROD_CORS_ORIGIN"];
initObservability();
initSettings();
app.use(express2.json());
if (isDevelopment) {
  console.warn("Running in development mode - allowing CORS for all origins");
  app.use(cors());
} else if (prodCorsOrigin) {
  console.log(
    `Running in production mode - allowing CORS for domain: ${prodCorsOrigin}`
  );
  const corsOptions = {
    origin: prodCorsOrigin
    // Restrict to production domain
  };
  app.use(cors(corsOptions));
} else {
  console.warn("Production CORS origin not set, defaulting to no CORS.");
}
app.use(express2.text());
app.use(fileUpload());
app.get("/", (req, res) => {
  res.send("LlamaIndex Express Server");
});
app.use("/api/chat", chat_route_default);
app.listen(port, () => {
  console.log(`\u26A1\uFE0F[server]: Server is running at http://localhost:${port}`);
});
