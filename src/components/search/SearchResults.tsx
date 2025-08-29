import React from 'react';
import { Music, User, PlayCircle, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export const SearchResults = ({ results, isLoading, query }: SearchResultsProps) => {
  const navigate = useNavigate();
  const { actions } = usePlayer();

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'song':
        actions.playSong(result.data);
        break;
      case 'playlist':
        navigate(`/playlist/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
      case 'artist':
        navigate(`/artist/${encodeURIComponent(result.data.artist)}`);
        break;
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'song':
        return <Music className="w-4 h-4" />;
      case 'playlist':
        return <PlayCircle className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'artist':
        return <Users className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'song':
        return 'bg-blue-100 text-blue-800';
      case 'playlist':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'artist':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find anything matching "{query}". Try adjusting your search terms.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Search tips:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Check your spelling</li>
            <li>Try different or more general keywords</li>
            <li>Use fewer filters</li>
          </ul>
        </div>
      </div>
    );
  }

  // Group results by type for better display
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type}>
          <h2 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
            {getResultIcon(type as SearchResult['type'])}
            {type}s ({typeResults.length})
          </h2>
          
          <div className="grid gap-3">
            {typeResults.map((result) => (
              <Card
                key={result.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {result.image ? (
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={result.image} alt={result.title} />
                          <AvatarFallback className="rounded-lg">
                            {getResultIcon(result.type)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                      
                      {result.type === 'song' && (
                        <Button
                          size="sm"
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.playSong(result.data);
                          }}
                        >
                          <PlayCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {result.title}
                        </h3>
                        <Badge variant="secondary" className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                      </div>
                      
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}

                      {result.type === 'song' && result.data.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(result.data.duration)}
                        </div>
                      )}
                    </div>

                    {result.type === 'song' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.addToQueue([result.data]);
                        }}
                      >
                        Add to Queue
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};