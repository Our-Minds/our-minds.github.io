
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { UserData } from './types';

// Hook to fetch users
export const useUsers = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as UserData[];
    },
    enabled: !!isAdmin,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to promote a user to admin
export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { userId, newRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User role updated',
        description: `User has been promoted to ${data.newRole}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update user role',
        description: error.message || 'An error occurred while updating the user role.',
        variant: 'destructive',
      });
    },
  });
};

// Hook to remove a user
export const useRemoveUser = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }

      // Cascade delete all related data in the correct order to avoid foreign key constraints
      
      // 1. Delete comment votes
      await supabase.from('comment_votes').delete().eq('user_id', userId);
      
      // 2. Delete story likes
      await supabase.from('story_likes').delete().eq('user_id', userId);
      
      // 3. Delete story comments
      await supabase.from('story_comments').delete().eq('user_id', userId);
      
      // 4. Delete chat messages (as sender)
      await supabase.from('chat_messages').delete().eq('sender_id', userId);
      
      // 5. Delete chat threads (as user or consultant)
      await supabase.from('chat_threads').delete().or(`user_id.eq.${userId},consultant_id.eq.${userId}`);
      
      // 6. Delete consultant availability
      await supabase.from('consultant_availability').delete().eq('consultant_id', userId);
      
      // 7. Delete reviews (as user or consultant)
      await supabase.from('reviews').delete().or(`user_id.eq.${userId},consultant_id.eq.${userId}`);
      
      // 8. Delete sessions (as user or consultant)
      await supabase.from('sessions').delete().or(`user_id.eq.${userId},consultant_id.eq.${userId}`);
      
      // 9. Delete transactions (as user or consultant)
      await supabase.from('transactions').delete().or(`user_id.eq.${userId},consultant_id.eq.${userId}`);
      
      // 10. Delete stories authored by user
      await supabase.from('stories').delete().eq('author_id', userId);
      
      // 11. Delete consultant profile if exists
      await supabase.from('consultants').delete().eq('id', userId);
      
      // 12. Finally delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { userId };
    },
    onSuccess: () => {
      // Invalidate multiple query caches since we deleted from multiple tables
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-consultants'] });
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      
      toast({
        title: 'User removed',
        description: 'The user and all their associated data have been completely removed from the platform.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove user',
        description: error.message || 'An error occurred while removing the user.',
        variant: 'destructive',
      });
    },
  });
};
