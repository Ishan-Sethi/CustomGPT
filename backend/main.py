import os.path
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings
)
from dotenv import load_dotenv
from llama_parse import LlamaParse
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
load_dotenv()

# PDF Parser
LLLAMA_PARSE = os.getenv('LLLAMA_PARSE')
parser = LlamaParse(
    api_key=LLLAMA_PARSE,
    result_type="markdown",  # "markdown" and "text" are available
    verbose=True
)

# LLM Setup

Settings.embed_model = OllamaEmbedding (
    model_name="mistral"
)
Settings.llm = Ollama(
    model="mistral",
    request_timeout=9999.0
)

PERSIST_DIR = "./storage"
if not os.path.exists(PERSIST_DIR):
    # load the documents and create the index
    documents = SimpleDirectoryReader("./data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    # store it for later
    index.storage_context.persist(persist_dir=PERSIST_DIR)
else:
    # load the existing index
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    index = load_index_from_storage(storage_context)

# Either way we can now query the index
query_engine = index.as_query_engine()
response = query_engine.query("summarize the article")
print(response)

