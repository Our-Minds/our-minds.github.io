
import { useAuth } from '@/context/AuthContext';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import ChatEmptyState from '@/components/chat/ChatEmptyState';
import { useChatMessages, ChatParticipant } from '@/hooks/useChatMessages';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatContentProps {
  selectedChatId: string;
}

export function ChatContent({ selectedChatId }: ChatContentProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    chatParticipants, 
    transformedMessages, 
    sendMessage
  } = useChatMessages(selectedChatId);

  if (!selectedChatId) {
    return <ChatEmptyState />;
  }

  return (
    <>
      <ChatHeader 
        participants={chatParticipants}
        currentUserId={user?.id}
      />
      <ChatMessages 
        chat={{ 
          id: selectedChatId, 
          messages: transformedMessages,
          participants: chatParticipants as ChatParticipant[],
          lastActive: new Date().toISOString(),
        }}
        isMobile={isMobile}
        messageAreaBottomPadding={isMobile ? "pb-20" : "pb-4"}
      />
      <ChatInput onSendMessage={sendMessage} />
    </>
  );
}

export default ChatContent;
