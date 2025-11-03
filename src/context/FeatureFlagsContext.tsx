import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformSettings {
  platformName: string;
  contactEmail: string;
  platformFee: number;
  enableChat: boolean;
  enableBooking: boolean;
  enableStories: boolean;
  mission: string;
  vision: string;
  values: string;
}

interface FeatureFlagsContextType {
  settings: PlatformSettings | null;
  isLoading: boolean;
  error: Error | null;
  // Feature flag helpers
  isChatEnabled: boolean;
  isBookingEnabled: boolean;
  isStoriesEnabled: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['platform-settings-public'],
    queryFn: async (): Promise<PlatformSettings> => {
      // This is a public query that doesn't require authentication
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching platform settings:', error);
        // Return default settings if there's an error
        return {
          platformName: 'Mental Health Platform',
          contactEmail: 'support@example.com',
          platformFee: 4,
          enableChat: true,
          enableBooking: true,
          enableStories: true,
          mission: 'Our mission is to make mental health support accessible to everyone, everywhere.',
          vision: 'We envision a world where mental health is treated with the same importance as physical health.',
          values: 'Compassion, Accessibility, Quality, Privacy, and Inclusion.'
        };
      }
      
      // If no settings exist, return defaults
      if (!data) {
        return {
          platformName: 'Mental Health Platform',
          contactEmail: 'support@example.com',
          platformFee: 4,
          enableChat: true,
          enableBooking: true,
          enableStories: true,
          mission: 'Our mission is to make mental health support accessible to everyone, everywhere.',
          vision: 'We envision a world where mental health is treated with the same importance as physical health.',
          values: 'Compassion, Accessibility, Quality, Privacy, and Inclusion.'
        };
      }
      
      // Extract platform name from mission field (which stores "PlatformName - Mission")
      const missionParts = data.mission?.split(' - ');
      const platformName = missionParts?.[0] || 'Mental Health Platform';
      
      return {
        platformName,
        contactEmail: data.contact_email || 'support@example.com',
        platformFee: data.platform_fee_percentage || 4,
        enableChat: data.enable_chat ?? true,
        enableBooking: data.enable_booking ?? true,
        enableStories: data.enable_stories ?? true,
        mission: data.mission || 'Our mission is to make mental health support accessible to everyone, everywhere.',
        vision: data.vision || 'We envision a world where mental health is treated with the same importance as physical health.',
        values: data.values || 'Compassion, Accessibility, Quality, Privacy, and Inclusion.'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const contextValue: FeatureFlagsContextType = {
    settings,
    isLoading,
    error: error as Error | null,
    // Feature flag helpers
    isChatEnabled: settings?.enableChat ?? true,
    isBookingEnabled: settings?.enableBooking ?? true,
    isStoriesEnabled: settings?.enableStories ?? true,
  };

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

// Individual feature flag hooks for convenience
export function usePlatformSettings() {
  const { settings } = useFeatureFlags();
  return settings;
}

export function useFeatureFlag(feature: 'chat' | 'booking' | 'stories'): boolean {
  const { isChatEnabled, isBookingEnabled, isStoriesEnabled } = useFeatureFlags();
  
  switch (feature) {
    case 'chat':
      return isChatEnabled;
    case 'booking':
      return isBookingEnabled;
    case 'stories':
      return isStoriesEnabled;
    default:
      return false;
  }
}