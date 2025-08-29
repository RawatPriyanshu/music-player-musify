import React from 'react';
import { Clock, Search, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  recentSearches: string[];
  onSuggestionClick: (suggestion: string) => void;
  onClearHistory: () => void;
}

export const SearchSuggestions = ({
  query,
  suggestions,
  recentSearches,
  onSuggestionClick,
  onClearHistory
}: SearchSuggestionsProps) => {
  const showRecent = !query && recentSearches.length > 0;
  const showSuggestions = query && suggestions.length > 0;
  
  if (!showRecent && !showSuggestions) return null;

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 p-0 border shadow-lg bg-background/95 backdrop-blur-sm z-50 max-h-80 overflow-y-auto">
      {showRecent && (
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Recent searches</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(search)}
                className="w-full text-left px-2 py-1 rounded-md hover:bg-muted transition-colors text-sm flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-muted-foreground" />
                <span>{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showRecent && showSuggestions && (
        <Separator />
      )}

      {showSuggestions && (
        <div className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Suggestions</span>
          </div>
          
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left px-2 py-1 rounded-md hover:bg-muted transition-colors text-sm flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-muted-foreground" />
                <span>
                  {suggestion.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                      <span key={i} className="font-medium text-primary">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search with current query option */}
      {query && (
        <>
          {(showRecent || showSuggestions) && <Separator />}
          <div className="p-3">
            <button
              onClick={() => onSuggestionClick(query)}
              className="w-full text-left px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm flex items-center gap-2 font-medium"
            >
              <Search className="w-4 h-4 text-primary" />
              <span>Search for "{query}"</span>
            </button>
          </div>
        </>
      )}
    </Card>
  );
};