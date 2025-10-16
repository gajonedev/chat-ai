import { ChatShell } from "@/components/chat/chat-shell"
import { getMockChatData } from "@/components/chat/mock-data"

export default function Home() {
  const data = getMockChatData()

  return <ChatShell data={data} />
}
