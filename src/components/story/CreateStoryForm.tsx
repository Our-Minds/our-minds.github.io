import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { StoryImageUploader } from './StoryImageUploader';
import { StoryTagSelector, STORY_TAG_OPTIONS } from './StoryTagSelector';
import { Story } from '@/utils/consultantTypes';
import { ArrowLeft, ArrowRight, Eye, Upload, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateStoryFormProps {
  onClose: () => void;
  story?: Story;
}

export function CreateStoryForm({ onClose, story }: CreateStoryFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: story?.title || '',
    snippet: story?.snippet || '',
    content: story?.content || '',
    tags: story?.tags || ['Mental Health'],
    tagType: (story?.tag_type || 'mental') as 'mental' | 'control' | 'drugs' | 'life' | 'anxiety' | 'depression',
    coverImage: story?.cover_image || '',
    isAnonymous: story?.is_anonymous || false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(story?.cover_image || '');

  // Set initial data if editing an existing story
  useEffect(() => {
    if (story) {
      setImagePreview(story.cover_image);
      setFormData({
        title: story.title,
        snippet: story.snippet,
        content: story.content,
        tags: story.tags,
        tagType: story.tag_type,
        coverImage: story.cover_image,
        isAnonymous: story.is_anonymous || false,
      });
    }
  }, [story]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, coverImage: URL.createObjectURL(file) }));
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagValue = e.target.value as 'mental' | 'control' | 'drugs' | 'life' | 'anxiety' | 'depression';
    const tagLabel = STORY_TAG_OPTIONS.find(opt => opt.value === tagValue)?.label || '';
    
    setFormData(prev => ({
      ...prev,
      tagType: tagValue,
      tags: [tagLabel, ...prev.tags.slice(1)], // Replace first tag, keep others
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('story_images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('story_images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a story",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing information",
        description: "Please provide a title and content for your story",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image first if selected
      let coverImageUrl = formData.coverImage;
      
      if (selectedImage) {
        coverImageUrl = await uploadImage(selectedImage);
      }
      
      // Get current session to ensure we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("You must be logged in to create a story");
      }
      
      // Create story object
      const storyData = {
        title: formData.title,
        snippet: formData.snippet || formData.content.slice(0, 100) + '...',
        content: formData.content,
        cover_image: coverImageUrl,
        author_id: user.id,
        tags: formData.tags,
        tag_type: formData.tagType,
        is_featured: story ? story.is_featured : false,
        published_at: story ? story.published_at : new Date().toISOString(),
        is_anonymous: formData.isAnonymous
      };

      let result;
      
      if (story) {
        // Update existing story
        result = await supabase
          .from('stories')
          .update(storyData)
          .eq('id', story.id)
          .eq('author_id', user.id)
          .select('id')
          .single();
      } else {
        // Insert new story
        result = await supabase
          .from('stories')
          .insert(storyData)
          .select('id')
          .single();
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }
      
      toast({
        title: story ? "Story updated!" : "Story published!",
        description: story ? "Your story has been updated successfully" : "Your story has been published successfully",
      });
      
      onClose();
      
      // Refresh the page to show the updated stories list
      setTimeout(() => {
        if (story) {
          window.location.reload();
        } else {
          navigate(`/story/${data.id}`);
        }
      }, 500);
    } catch (error: any) {
      console.error('Error creating/updating story:', error);
      toast({
        title: story ? "Failed to update story" : "Failed to create story",
        description: error?.message || "There was an error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.title.trim() && formData.content.trim();
  const canProceedToStep3 = canProceedToStep2 && formData.snippet.trim();

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToStep2) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && !canProceedToStep3) {
      toast({
        title: "Missing information",
        description: "Please provide a description",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-border/30">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 mx-1 transition-colors ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Step 1: Title and Content */}
        {currentStep === 1 && (
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Story Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                placeholder="Give your story a compelling title..."
                className="text-lg font-medium"
                autoFocus
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="content" className="text-base font-semibold">
                Your Story
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Share your journey, experiences, and insights..."
                className="min-h-[300px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length} characters
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Description and Thumbnail */}
        {currentStep === 2 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <Label htmlFor="snippet" className="text-base font-semibold">
                Short Description
              </Label>
              <Textarea
                id="snippet"
                name="snippet"
                value={formData.snippet}
                onChange={handleInputChange}
                placeholder="Write a brief description that will appear in previews (recommended 150-200 characters)"
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {formData.snippet.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Cover Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <StoryImageUploader
                  imagePreview={imagePreview}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a cover image to make your story stand out
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Preview, Tags and Publish */}
        {currentStep === 3 && (
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Eye className="w-5 h-5" />
                Preview & Publish
              </div>

              {/* Preview Card */}
              <div className="border border-border rounded-lg p-6 bg-muted/30 space-y-4">
                {imagePreview && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Story cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.snippet || formData.content.slice(0, 150) + '...'}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {formData.content}
                  </p>
                </div>
              </div>

              {/* Tag Selection */}
              <div className="space-y-2">
                <Label htmlFor="tagType" className="text-base font-semibold">
                  Primary Category
                </Label>
                <select
                  id="tagType"
                  name="tagType"
                  className="w-full h-11 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.tagType}
                  onChange={handleTagChange}
                >
                  {STORY_TAG_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose the category that best describes your story
                </p>
              </div>

              {/* Anonymous Publishing Toggle */}
              <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="isAnonymous" className="text-base font-semibold cursor-pointer">
                      Publish Anonymously
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your story will be public on the website but hidden from your public profile. Only you can see it in your profile.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/30 gap-3">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {story ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {story ? "Update Story" : "Publish Story"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStoryForm;
