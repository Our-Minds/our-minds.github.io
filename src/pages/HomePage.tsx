import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import FeaturedStory from '@/components/home/FeaturedStory';
import StoryHighlights from '@/components/home/StoryHighlights';
import { useFeatureFlag } from '@/context/FeatureFlagsContext';
import { ArrowUp, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Story } from '@/utils/consultantTypes';
import { useIsMobile } from '@/hooks/use-mobile';
export function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isStoriesEnabled = useFeatureFlag('stories');
  useEffect(() => {
    // Only fetch stories if the feature is enabled
    if (!isStoriesEnabled) {
      setIsLoading(false);
      return;
    }
    
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const {
          data: storiesData,
          error: storiesError
        } = await supabase.from('stories_with_authors').select('*').order('published_at', {
          ascending: false
        });
        if (storiesError) {
          throw storiesError;
        }
        if (storiesData) {
          const formattedStories: Story[] = storiesData.map((story: any) => ({
            id: story.id,
            title: story.title,
            snippet: story.snippet,
            content: story.content,
            cover_image: story.cover_image || '/placeholder.svg',
            tags: story.tags || [],
            tag_type: story.tag_type || 'mental',
            author_id: story.author_id,
            is_featured: story.is_featured || false,
            published_at: story.published_at,
            created_at: story.created_at,
            updated_at: story.updated_at,
            authorName: story.author_name,
            authorImage: story.author_image,
            author: {
              name: story.author_name || 'Anonymous',
              profile_image: story.author_image
            }
          }));
          setStories(formattedStories);
        }
      } catch (error: any) {
        console.error('Error fetching stories:', error);
        toast({
          title: 'Failed to load stories',
          description: error.message || 'Could not retrieve stories from the database',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, [toast, isStoriesEnabled]);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <Layout showSidebar={true}>
      <div className="w-full h-full bg-white dark:bg-[#212121]">
        {!isStoriesEnabled ? (
          // Stories disabled - show alternative content
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Stories Currently Unavailable</h2>
              <p className="text-muted-foreground mb-6">
                The stories feature is temporarily disabled. Please check back later or contact support for more information.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        ) : isMobile ? (
      // Mobile: Stacked layout
      <div className="flex flex-col h-full">
            <div className="w-full border-b border-gray-200 dark:border-[#3a3a3a]">
              <div className="p-4">
                {isLoading ? <FeaturedStory stories={stories} isLoading={true} /> : <FeaturedStory stories={stories.map(story => ({
              ...story,
              linkWrapper: (children: React.ReactNode) => <Link to={`/story/${story.id}`}>{children}</Link>
            }))} isLoading={false} />}
              </div>
            </div>
            
            <div className="flex-1 pb-20">
              {isLoading ? <StoryHighlights stories={stories} isLoading={true} /> : <StoryHighlights stories={stories.map(story => ({
            ...story,
            linkWrapper: (children: React.ReactNode) => <Link to={`/story/${story.id}`}>{children}</Link>
          }))} isLoading={false} />}
            </div>
          </div>) : (
      // Desktop: Side-by-side layout with clear boundaries
      <div className="flex h-[calc(100vh-3.5rem)] w-full">
            {/* Left Panel - Featured Story with exact width and border */}
            <div className="w-1/2 h-full border-r-2 border-gray-300 dark:border-[#3a3a3a] overflow-hidden">
              <div className="h-full p-6 overflow-y-auto bg-white dark:bg-[#212121]">
                {isLoading ? <FeaturedStory stories={stories} isLoading={true} /> : <FeaturedStory stories={stories.map(story => ({
              ...story,
              linkWrapper: (children: React.ReactNode) => <Link to={`/story/${story.id}`}>{children}</Link>
            }))} isLoading={false} />}
              </div>
            </div>

            {/* Right Panel - Story Highlights with exact width */}
            <div className="w-1/2 h-full overflow-hidden">
              {isLoading ? <StoryHighlights stories={stories} isLoading={true} /> : <StoryHighlights stories={stories.map(story => ({
            ...story,
            linkWrapper: (children: React.ReactNode) => <Link to={`/story/${story.id}`}>{children}</Link>
          }))} isLoading={false} />}
            </div>
          </div>)}
      </div>

      {showScrollTop}
    </Layout>;
}
export default HomePage;