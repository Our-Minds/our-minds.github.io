
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Story } from "@/utils/types";
import { StoryContent } from "./StoryContent";
import { CommentsSection } from "@/components/comments/CommentsSection";

interface MobileStoryCommentsToggleProps {
  story: Story;
}

export function MobileStoryCommentsToggle({ story }: MobileStoryCommentsToggleProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="space-y-4 pb-4">
      {!showComments ? (
        <>
          {/* Story Content (includes Similar Stories now) */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <StoryContent story={story} />
          </div>
          {/* Comments Button */}
          <div className="flex justify-center pb-20">
            <Button
              onClick={() => setShowComments(true)}
              className="bg-[#037004] hover:bg-[#025803] text-white flex items-center gap-2 px-6 py-3 rounded-full shadow-lg"
            >
              <MessageCircle size={18} />
              <span>View Comments & Discussion</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border border-border min-h-[calc(100vh-8rem)]">
          <div className="p-3 border-b border-border bg-muted">
            <h3 className="font-semibold text-[#037004] text-lg">Discussion</h3>
            <p className="text-sm text-muted-foreground">Join the conversation about "{story.title}"</p>
          </div>
          <div className="h-[calc(100vh-12rem)]">
            <CommentsSection storyId={story.id} />
          </div>
          <div className="mt-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(false)}
              className="text-[#037004] border-[#037004]"
            >
              Back to Story
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileStoryCommentsToggle;
