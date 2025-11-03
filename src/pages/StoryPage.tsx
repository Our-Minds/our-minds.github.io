import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Story } from '@/utils/types';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { SimilarStories } from '@/components/story/SimilarStories';
import { StoryContent } from '@/components/story/StoryContent';
import { useIsMobile } from '@/hooks/use-mobile';
import BackButton from "@/components/story/BackButton";
import StoryLayoutContainer from "@/components/story/StoryLayoutContainer";

export function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        if (!storyId) {
          navigate('/');
          return;
        }

        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (error) throw error;

        if (data) {
          let author = { name: 'Anonymous', profile_image: null };

          if (data.author_id) {
            const { data: authorData, error: authorError } = await supabase
              .from('users')
              .select('name, profile_image')
              .eq('id', data.author_id)
              .single();

            if (!authorError && authorData) {
              author = authorData;
            }
          }

          const tagType = data.tag_type as 'mental' | 'control' | 'drugs' | 'life' | 'anxiety' | 'depression';

          const storyWithAuthor: Story = {
            ...data,
            tag_type: tagType,
            author: author
          };

          setStory(storyWithAuthor);
          document.title = `${data.title} | Our Minds`;
        } else {
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error fetching story:', error);
        toast({
          title: "Failed to load story",
          description: error.message || "Could not retrieve the story",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId, navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-background">
          <div className="container mx-auto p-4 lg:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-[#037004]">Loading story...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout>
        <div className="bg-background">
          <div className="container mx-auto p-4 lg:p-6">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Story not found</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`bg-background ${isMobile ? 'min-h-screen' : 'h-full overflow-hidden'} flex flex-col`}>
        <div className={`${isMobile ? 'flex flex-col' : 'flex-1 flex flex-col min-h-0'} ${isMobile ? 'p-2' : 'p-4 lg:p-6'} max-w-7xl mx-auto w-full`}>
          <div className={isMobile ? '' : 'flex-1 min-h-0 overflow-hidden'}>
            <StoryLayoutContainer story={story} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default StoryPage;
