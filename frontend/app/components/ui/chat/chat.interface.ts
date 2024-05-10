import { Message } from "ai";

export interface ChatHandler {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  input: string;
  isLoading: boolean;
  cachePath: string;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    ops?: {
      data?: any;
    },
  ) => void;
  setPath: (path: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reload?: () => void;
  stop?: () => void;
  onFileUpload?: (file: File) => Promise<void>;
  onFileError?: (errMsg: string) => void;
}
