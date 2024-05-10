import ChatSection from "./components/chat-section";

export default function Home() {
  return (
    <div className="">
      <div className="flex min-h-screen flex-col items-center gap-10 px-24 background-gradient">
        <ChatSection />
      </div>
    </div>
  );
}
