import React from 'react';
import { useFeatureFlag } from '@/context/FeatureFlagsContext';
import { FeatureDisabledPage } from './FeatureDisabledPage';
import { MessageCircle, Calendar, BookOpen } from 'lucide-react';

interface FeatureGuardProps {
  feature: 'chat' | 'booking' | 'stories';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default disabled page based on feature
    switch (feature) {
      case 'chat':
        return (
          <FeatureDisabledPage
            featureName="Chat"
            description="The chat feature allows direct communication with consultants."
            icon={<MessageCircle className="h-12 w-12 text-muted-foreground" />}
          />
        );
      case 'booking':
        return (
          <FeatureDisabledPage
            featureName="Session Booking"
            description="Book one-on-one sessions with our mental health consultants."
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
          />
        );
      case 'stories':
        return (
          <FeatureDisabledPage
            featureName="Stories"
            description="Read and share inspiring mental health stories from our community."
            icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
          />
        );
      default:
        return (
          <FeatureDisabledPage
            featureName="Feature"
            description="This feature is currently unavailable."
          />
        );
    }
  }

  return <>{children}</>;
}