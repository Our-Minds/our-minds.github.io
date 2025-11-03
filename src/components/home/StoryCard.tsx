import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Story } from '@/utils/consultantTypes';
import { MessageCircle, User, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { findOrCreateChatThread } from '@/utils/chatUtils';
interface StoryCardProps {
  story: Story;
  index: number;
  isSearching: boolean;
}
export function StoryCard({
  story,
  index,
  isSearching
}: StoryCardProps) {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleStartChat = async (authorId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to chat with authors",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    if (user?.id === authorId) {
      toast({
        title: "Cannot chat with yourself",
        description: "You cannot start a chat with yourself",
        variant: "destructive"
      });
      return;
    }
    try {
      const thread = await findOrCreateChatThread(authorId, user!.id);
      navigate(`/chat/${thread.id}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast({
        title: "Failed to start chat",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Function to extract preview text from story content
  const getContentPreview = (content: string, maxLength: number = 120) => {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return strippedContent.length > maxLength ? strippedContent.substring(0, maxLength) + '...' : strippedContent;
  };

  // Function to get tag color based on tag type
  const getTagColor = (tagType: string) => {
    const tagColors = {
      mental: 'bg-blue-500',
      control: 'bg-purple-500',
      drugs: 'bg-red-500',
      life: 'bg-green-500',
      anxiety: 'bg-orange-500',
      depression: 'bg-indigo-500'
    };
    return tagColors[tagType as keyof typeof tagColors] || 'bg-gray-500';
  };

  // Function to get reading time estimate
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };
  const authorName = story.authorName || story.author?.name || 'Anonymous';
  const authorImage = story.authorImage || story.author?.profile_image || null;
  const authorId = story.author_id;
  const contentPreview = getContentPreview(story.content);
  const readingTime = getReadingTime(story.content);
  return <div className="relative">
      <Link to={`/story/${story.id}`} className="block">
        <Card className="overflow-hidden border border-border bg-card rounded-lg">
          {/* Background Image at Top */}
          <div className="relative w-full aspect-[2/1] overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `url(${story.cover_image || '/placeholder.svg'})`
          }} />
          </div>
          
          {/* Story Content Below Image */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Story Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {story.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white ${getTagColor(story.tag_type)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Story Title */}
                <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2">
                  {story.title}
                </h3>

                {/* Content Preview */}
                {contentPreview && <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">
                    {contentPreview}
                  </p>}

                {/* Publication Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(story.published_at), {
                    addSuffix: true
                  })}</span>
                </div>
              </div>
              
              {/* Enhanced Author Info & Actions */}
              {story.is_anonymous ? <div className="flex items-center justify-center pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">
                    Message Shared Anonymously
                  </p>
                </div> : <div className="flex items-center justify-between pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={authorImage || '/placeholder.svg'} alt={authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" onError={e => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-card rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{authorName}</span>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/profile/${authorId}`);
                }} className="p-2 rounded-full hover:bg-accent" title="View Profile">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStartChat(authorId);
                }} className="p-2 rounded-full hover:bg-accent" title={`Chat with ${authorName.split(' ')[0]}`}>
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>}
            </div>
          </div>
        </Card>
      </Link>
    </div>;
}