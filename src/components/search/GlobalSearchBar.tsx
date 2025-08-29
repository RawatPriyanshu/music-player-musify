import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Clock, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GlobalSearchBarProps {
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const GlobalSearchBar = ({ className, onFocus, onBlur }: GlobalSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    filters,
    setFilters,
    recentSearches,
    clearHistory,
    performSearch
  } = useSearch();

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  // Handle input blur with delay to allow clicks on suggestions
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      onBlur?.();
    }, 200);
  };

  // Handle search submission
  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      inputRef.current?.blur();
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchQuery) {
      performSearch(searchQuery, newFilters);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to blur search
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const hasActiveFilters = filters.type !== 'all' || filters.genre || filters.duration || filters.dateRange || filters.isPublic !== undefined;

  return (
    <div className={cn("relative flex-1 max-w-lg mx-8", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search songs, artists, playlists... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className={cn(
            "pl-10 pr-20 rounded-full transition-all duration-200",
            isFocused && "ring-2 ring-primary ring-offset-2"
          )}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 w-6 p-0 rounded-full hover:bg-muted",
                  hasActiveFilters && "text-primary bg-primary/10"
                )}
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <SearchFiltersPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (isFocused || suggestions.length > 0 || recentSearches.length > 0) && (
        <SearchSuggestions
          query={searchQuery}
          suggestions={suggestions}
          recentSearches={recentSearches}
          onSuggestionClick={handleSuggestionClick}
          onClearHistory={clearHistory}
        />
      )}
    </div>
  );
};