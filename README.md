# CustomGPT
CustomGPT is a side project that empowers users to build and train a customized version of ChatGPT entirely on their local machine. Leveraging RAG through llamaindex and a local LLM instance via Ollama, users can securely harness LLM technologies without exposing private or sensitive data to external servers. The project's backend is built on Express.js, the frontend on Next.js, and both are run seamlessly in Electron.js for local deployment. 

## Deployment
Install [Ollama](https://ollama.com/) 
```
ollama pull llama3
git clone https://github.com/Ishan-Sethi/CustomGPT.git
cd CustomGPT/Backend
npm run dev
cd CustomGPT/Frontend
npm run dev
```

Demo:



https://github.com/user-attachments/assets/582fb836-e32f-45ec-b0c9-283f9c2fe133


