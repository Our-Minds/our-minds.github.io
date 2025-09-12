
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, ChevronDown, Reply, MoreHorizontal, Trash2 } from 'lucide-react';
import { Comment } from '@/types/comments';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote' | null) => void;
  onReply: (parentCommentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isVoting?: boolean;
  isReplying?: boolean;
  isDeleting?: boolean;
  depth?: number;
}

export function CommentItem({ 
  comment, 
  onVote, 
  onReply, 
  onDelete,
  isVoting = false, 
  isReplying = false,
  isDeleting = false,
  depth = 0 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    const newVote = comment.user_vote === voteType ? null : voteType;
    onVote(comment.id, newVote);
  };

  const handleReply = (content: string) => {
    onReply(comment.id, content);
    setShowReplyForm(false);
  };

  const netScore = comment.upvotes - comment.downvotes;
  const maxDepth = 6;

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-6 border-l-2 border-gray-100 pl-4")}>
      <div className="space-y-2">
        {/* Comment Header */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author?.profile_image || undefined} />
            <AvatarFallback className="text-xs">
              {comment.author?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{comment.author?.name || 'Anonymous'}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {comment.is_edited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

        {/* Comment Content */}
        {!isCollapsed && (
          <>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-1">
              {/* Vote buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-1",
                    comment.user_vote === 'upvote' && "text-orange-500 bg-orange-50"
                  )}
                  onClick={() => handleVote('upvote')}
                  disabled={isVoting}
                >
                  <ChevronUp size={14} />
                </Button>
                <span className={cn(
                  "text-xs font-medium min-w-[20px] text-center",
                  netScore > 0 && "text-orange-500",
                  netScore < 0 && "text-blue-500"
                )}>
                  {netScore}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-1",
                    comment.user_vote === 'downvote' && "text-blue-500 bg-blue-50"
                  )}
                  onClick={() => handleVote('downvote')}
                  disabled={isVoting}
                >
                  <ChevronDown size={14} />
                </Button>
              </div>

              {/* Reply button */}
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply size={12} className="mr-1" />
                  Reply
                </Button>
              )}

              {/* Collapse button */}
              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? `[+] ${comment.replies.length} replies` : '[-]'}
                </Button>
              )}

              {/* Options menu - only show if user owns the comment */}
              {user && user.id === comment.user_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <MoreHorizontal size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={12} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}

        {/* Collapsed state */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-500"
            onClick={() => setIsCollapsed(false)}
          >
            [+] {comment.author?.name} ({netScore} points) - {comment.replies?.length || 0} replies
          </Button>
        )}

        {/* Reply Form */}
        {showReplyForm && !isCollapsed && (
          <div className="mt-3">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              submitText="Reply"
              isSubmitting={isReplying}
              isReply={true}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onReply={onReply}
              onDelete={onDelete}
              isVoting={isVoting}
              isReplying={isReplying}
              isDeleting={isDeleting}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
