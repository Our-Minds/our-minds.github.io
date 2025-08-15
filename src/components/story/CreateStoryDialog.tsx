
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Story } from "@/utils/consultantTypes";
import CreateStoryForm from "./CreateStoryForm";
import { PenTool, Sparkles, BookOpen } from "lucide-react";

interface CreateStoryDialogProps {
  children?: React.ReactNode;
  story?: Story;
  onOpenChange?: (open: boolean) => void;
}

export function CreateStoryDialog({ children, story, onOpenChange }: CreateStoryDialogProps) {
  const [open, setOpen] = useState(false);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <PenTool className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 border-0 shadow-2xl rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        
        <DialogHeader className="relative z-10 pb-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 ring-1 ring-primary/20">
              {story ? (
                <BookOpen className="w-6 h-6 text-primary" />
              ) : (
                <Sparkles className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {story ? 'Edit Your Story' : 'Create Your Story'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {story ? 'Update your story and share your journey' : 'Share your mental health journey with others'}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative z-10 max-h-[65vh] overflow-y-auto scrollbar-thin pr-2">
          <div className="py-4">
            <CreateStoryForm story={story} onClose={() => handleOpenChange(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateStoryDialog;
