
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { useChatThread } from '@/hooks/useChatThread';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useChatMessages, ChatParticipant } from '@/hooks/useChatMessages';
import { FileUploadResult } from '@/utils/fileUpload';
import ChatHeaderContainer from '@/components/chat/ChatHeaderContainer';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInputContainer from '@/components/chat/ChatInputContainer';
import ChatEmptyState from '@/components/chat/ChatEmptyState';
import ChatHeader from '@/components/chat/ChatHeader';

export function ChatPage() {
  const { consultantId, threadId } = useParams<{
    consultantId?: string;
    threadId?: string;
  }>();
  const { user, isAuthenticated } = useAuth();
  const { selectedChatId, setSelectedChatId } = useChatThread(
    consultantId,
    threadId
  );
  const isMobile = useIsMobile();
  const [showChatSidebar, setShowChatSidebar] = useState(!isMobile);

  const {
    chatParticipants,
    transformedMessages,
    sendMessage,
  } = useChatMessages(selectedChatId);

  useUserPresence();

  if (!isAuthenticated) {
    return <AuthRedirect />;
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setShowChatSidebar(false);
    }
  };

  const handleBackToChats = () => {
    if (isMobile) {
      setShowChatSidebar(true);
      setSelectedChatId('');
    }
  };

  const handleSendMessage = (
    content: string,
    attachment?: FileUploadResult
  ) => {
    sendMessage(content, attachment);
  };

  // Mobile: Bottom padding for fixed input
  // Desktop: Increased padding to prevent overlap with input
  const messageAreaBottomPadding = isMobile ? 'pb-32' : 'pb-28';

  // Always showSidebar for Layout so main navigation never disappears
  // Hide mobile bottom nav when a chat is open to prevent overlap
  return (
    <Layout showSidebar={true} hideMobileBottomNav={isMobile && !!selectedChatId}>
      {/* Main container - Use available height from Layout */}
      <div className="flex h-full min-h-0 overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-[#212121] dark:to-[#1a1a1a]">
        {/* Mobile Chat Sidebar Overlay */}
        {isMobile && showChatSidebar && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowChatSidebar(false)}
          />
        )}

        {/* Chat Sidebar - Responsive height, no scroll issues */}
        <div
          className={`
            ${isMobile
              ? `fixed inset-0 z-50 transform transition-transform duration-300 ${
                  showChatSidebar ? 'translate-x-0' : '-translate-x-full'
                } animate-fade-in`
              : 'w-80'}
            ${!isMobile
              ? 'border-r border-gray-200/80 dark:border-[#2a2a2a]/80'
              : ''}
            bg-white dark:bg-[#1a1a1a] h-full shrink-0 overflow-hidden
            flex flex-col
          `}
        >
          <ChatSidebar
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Main Chat Area - explicit height constraint to prevent overflow */}
        <div
          className={`
            flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1a1a] overflow-hidden animate-fade-in
            ${isMobile && showChatSidebar ? 'hidden' : 'flex'}
            h-[calc(100vh-3.5rem)]
          `}
        >
          {/* Fixed Height Container for Header + Messages + Input */}
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header: Fixed Height, Never Scrolls */}
            <div className="shrink-0 z-30 bg-white dark:bg-[#1a1a1a] shadow-md transition-all">
              {isMobile ? (
                <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#2a2a2a]/80">
                  <div className="flex items-center justify-between p-3 h-[73px]">
                    {selectedChatId ? (
                      <>
                        <button
                          onClick={handleBackToChats}
                          className="flex items-center gap-1 text-[#025803] dark:text-[#025803] font-medium -ml-2"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0 flex justify-center">
                          <ChatHeader
                            participants={chatParticipants}
                            currentUserId={user?.id}
                          />
                        </div>
                        <div className="w-8"></div>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowChatSidebar(true)}
                        className="flex items-center gap-2 text-[#025803] dark:text-[#025803] font-medium"
                      >
                        <Menu className="w-5 h-5" />
                        <span className="text-sm">Messages</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                selectedChatId && (
                  <ChatHeaderContainer
                    chatParticipants={chatParticipants}
                    currentUserId={user?.id}
                  />
                )
              )}
            </div>

            {/* Messages and Input Container - Takes remaining height */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {selectedChatId ? (
                <>
                  <ChatMessages
                    chat={{
                      id: selectedChatId,
                      messages: transformedMessages,
                      participants: chatParticipants as ChatParticipant[],
                      lastActive: new Date().toISOString(),
                    }}
                    isMobile={isMobile}
                    messageAreaBottomPadding={messageAreaBottomPadding}
                  />
                  {/* Desktop Input - Sticky to bottom, never scrolls */}
                  {!isMobile && (
                    <ChatInputContainer
                      onSendMessage={handleSendMessage}
                      isMobile={isMobile}
                    />
                  )}
                </>
              ) : (
                <ChatEmptyState />
              )}
            </div>
          </div>
        </div>

        {/* On mobile, ChatInputContainer will render using a portal. 
            So we REMOVE the in-tree rendering below! */}
        {/* {isMobile && selectedChatId && (
          <ChatInputContainer
            onSendMessage={handleSendMessage}
            isMobile={isMobile}
          />
        )} */}
        {/* Now always rendered at portal, not nested here */}
      </div>

      {/* Always mount ChatInputContainer for mobile in portal, 
          but it will only show itself (using portal) if needed. */}
      {isMobile && selectedChatId && (
        <ChatInputContainer
          onSendMessage={handleSendMessage}
          isMobile={isMobile}
        />
      )}
    </Layout>
  );
}

export default ChatPage;

