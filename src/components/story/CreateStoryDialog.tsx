import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Story } from "@/utils/consultantTypes";
import CreateStoryForm from "./CreateStoryForm";
import { PenTool, Sparkles, BookOpen } from "lucide-react";
interface CreateStoryDialogProps {
  children?: React.ReactNode;
  story?: Story;
  onOpenChange?: (open: boolean) => void;
}
export function CreateStoryDialog({
  children,
  story,
  onOpenChange
}: CreateStoryDialogProps) {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  useEffect(() => {
    if (story) {
      setOpen(true);
    }
  }, [story]);
  return <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden bg-background border border-border shadow-2xl rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {story ? <BookOpen className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
              </div>
              <DialogTitle className="text-xl font-semibold">
                {story ? 'Edit Story' : 'Create a Story'}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4 max-h-[calc(90vh-100px)] overflow-y-auto">
          <CreateStoryForm story={story} onClose={() => handleOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>;
}
export default CreateStoryDialog;