import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SearchFilters } from '@/hooks/useSearch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

export const SearchFiltersPanel = ({ filters, onFiltersChange, onClose }: SearchFiltersPanelProps) => {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ type: 'all' });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.genre || filters.duration || filters.dateRange || filters.isPublic !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Search Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Content Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="content-type">Content Type</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => updateFilter('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All content</SelectItem>
            <SelectItem value="song">Songs</SelectItem>
            <SelectItem value="artist">Artists</SelectItem>
            <SelectItem value="playlist">Playlists</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Genre Filter */}
      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          placeholder="e.g., Pop, Rock, Jazz..."
          value={filters.genre || ''}
          onChange={(e) => updateFilter('genre', e.target.value || undefined)}
        />
      </div>

      {/* Duration Filter (for songs) */}
      {(filters.type === 'song' || filters.type === 'all') && (
        <div className="space-y-2">
          <Label>Duration (seconds)</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.duration?.min || ''}
              onChange={(e) => updateFilter('duration', {
                ...filters.duration,
                min: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
            <span className="text-muted-foreground">to</span>
            <Input
              placeholder="Max"
              type="number"
              value={filters.duration?.max || ''}
              onChange={(e) => updateFilter('duration', {
                ...filters.duration,
                max: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.start ? format(filters.dateRange.start, 'MMM dd, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange?.start}
                onSelect={(date) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  start: date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.end ? format(filters.dateRange.end, 'MMM dd, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange?.end}
                onSelect={(date) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  end: date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Public Content Filter (for playlists) */}
      {(filters.type === 'playlist' || filters.type === 'all') && (
        <div className="flex items-center justify-between">
          <Label htmlFor="public-only">Public content only</Label>
          <Switch
            id="public-only"
            checked={filters.isPublic === true}
            onCheckedChange={(checked) => updateFilter('isPublic', checked ? true : undefined)}
          />
        </div>
      )}

      <Separator />

      <Button onClick={onClose} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
};