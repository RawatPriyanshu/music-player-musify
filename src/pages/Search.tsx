import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Filter, SlidersHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const query = searchParams.get('q') || '';

  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    filters,
    setFilters,
    performSearch
  } = useSearch();

  // Sync URL query with search state
  useEffect(() => {
    if (query && query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [query, searchQuery, setSearchQuery]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchParams(value ? { q: value } : {});
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery, filters);
    }
  };

  const hasActiveFilters = filters.type !== 'all' || filters.genre || filters.duration || filters.dateRange || filters.isPublic !== undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for songs, artists, playlists, or users..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg"
              />
            </div>
          </form>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {query && (
                <p className="text-muted-foreground">
                  Search results for "{query}"
                </p>
              )}
              {hasActiveFilters && (
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Filter className="w-4 h-4" />
                  <span>Filters active</span>
                </div>
              )}
            </div>
            
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <SearchFiltersPanel
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClose={() => setShowFilters(false)}
                    />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={searchQuery}
        />

        {/* No Query State */}
        {!searchQuery && !query && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Discover Music</h2>
            <p className="text-muted-foreground mb-6">
              Search for your favorite songs, artists, playlists, and discover new music.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <SearchIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Songs</p>
                <p className="text-muted-foreground">Find tracks by title or artist</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <SearchIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Artists</p>
                <p className="text-muted-foreground">Explore artist catalogs</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <SearchIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Playlists</p>
                <p className="text-muted-foreground">Discover curated collections</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <SearchIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Users</p>
                <p className="text-muted-foreground">Connect with other users</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;