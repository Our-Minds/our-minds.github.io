
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatThread, groupMessagesByDate } from '@/utils/chatFormatters';
import MessageGroup from './MessageGroup';
import { Button } from '@/components/ui/button';

interface ChatMessagesProps {
  chat: ChatThread;
  isMobile: boolean;
  messageAreaBottomPadding: string;
}

export function ChatMessages({
  chat,
  isMobile,
  messageAreaBottomPadding,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const [visibleMessageCount, setVisibleMessageCount] = useState(100);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Check if user is near bottom of scroll area
  const checkIfNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
  };

  // Handle scroll events to track position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsNearBottom(checkIfNearBottom());
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart auto-scroll: only when near bottom or new message
  useEffect(() => {
    const messageAdded = chat.messages.length > prevCountRef.current;
    const shouldScroll = isNearBottom || messageAdded;
    
    if (shouldScroll) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: messageAdded ? "smooth" : "auto" 
        });
      }, 100);
      
      prevCountRef.current = chat.messages.length;
      return () => clearTimeout(timeoutId);
    }
    
    prevCountRef.current = chat.messages.length;
  }, [chat.messages.length, isNearBottom]);

  // Initial scroll to bottom on mount or thread change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  }, [chat.id]);

  // Window messages by count, not by date groups
  const visibleMessages = chat.messages.slice(-visibleMessageCount);
  const messageGroups = groupMessagesByDate(visibleMessages);
  const hasMoreMessages = chat.messages.length > visibleMessageCount;

  const loadEarlierMessages = () => {
    const container = scrollContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;
    
    setVisibleMessageCount(prev => prev + 100);
    
    // Preserve scroll position after loading
    setTimeout(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
      }
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
        )}
        style={{
          WebkitOverflowScrolling: "touch"
        }}
      >
        <div className={cn('px-3 pt-4', messageAreaBottomPadding)}>
        {hasMoreMessages && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEarlierMessages}
              className="text-xs"
            >
              Load earlier messages
            </Button>
          </div>
        )}
        
        {messageGroups.map((group, groupIndex) => (
          <MessageGroup
            key={groupIndex}
            group={group}
            chat={chat}
            isMobile={isMobile}
          />
        ))}
        <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatMessages;
