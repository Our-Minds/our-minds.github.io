import { Input } from '@/components/ui/input';
import { Search, TrendingUp } from 'lucide-react';
interface StoryHighlightsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultCount: number;
}
export function StoryHighlightsHeader({
  searchQuery,
  setSearchQuery,
  resultCount
}: StoryHighlightsHeaderProps) {
  return <div className="sticky top-0 z-[90] p-3 border-b border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] flex-shrink-0">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3.5 h-3.5" />
        <Input type="text" placeholder="Search by title, content, tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm bg-gray-50 dark:bg-[#3a3a3a] border-gray-200 dark:border-[#4a4a4a] focus:bg-white dark:focus:bg-[#2a2a2a] focus:border-[#025803] dark:focus:border-[#037004] transition-colors text-gray-900 dark:text-gray-100" />
      </div>
      
      {searchQuery && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Found {resultCount} result{resultCount !== 1 ? 's' : ''} for "{searchQuery}"
        </p>}
    </div>;
}