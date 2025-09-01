import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, CalendarIcon } from 'lucide-react';
import { SearchFilters } from '@/hooks/useSearch';
import { format } from 'date-fns';

interface AdvancedSearchModalProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string, filters: SearchFilters) => void;
}

export const AdvancedSearchModal = ({ filters, onFiltersChange, onSearch }: AdvancedSearchModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationRange, setDurationRange] = useState([
    localFilters.duration?.min || 0,
    localFilters.duration?.max || 600
  ]);

  const handleApplyFilters = () => {
    const updatedFilters = {
      ...localFilters,
      duration: {
        min: durationRange[0] > 0 ? durationRange[0] : undefined,
        max: durationRange[1] < 600 ? durationRange[1] : undefined
      }
    };
    
    onFiltersChange(updatedFilters);
    if (searchQuery.trim()) {
      onSearch(searchQuery, updatedFilters);
    }
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = { type: 'all' };
    setLocalFilters(resetFilters);
    setDurationRange([0, 600]);
    setSearchQuery('');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Input
              id="search-query"
              placeholder="Enter your search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select
              value={localFilters.type || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="song">Songs Only</SelectItem>
                <SelectItem value="artist">Artists Only</SelectItem>
                <SelectItem value="playlist">Playlists Only</SelectItem>
                <SelectItem value="user">Users Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration Range */}
          <div className="space-y-4">
            <Label>Duration Range</Label>
            <div className="px-3">
              <Slider
                value={durationRange}
                onValueChange={setDurationRange}
                max={600}
                min={0}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{formatDuration(durationRange[0])}</span>
                <span>{formatDuration(durationRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange?.start 
                      ? format(localFilters.dateRange.start, 'PPP')
                      : 'From date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.start}
                    onSelect={(date) => setLocalFilters({
                      ...localFilters,
                      dateRange: { ...localFilters.dateRange, start: date }
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange?.end 
                      ? format(localFilters.dateRange.end, 'PPP')
                      : 'To date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.end}
                    onSelect={(date) => setLocalFilters({
                      ...localFilters,
                      dateRange: { ...localFilters.dateRange, end: date }
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Public Only Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="public-only">Public Content Only</Label>
            <Switch
              id="public-only"
              checked={localFilters.isPublic === true}
              onCheckedChange={(checked) => setLocalFilters({
                ...localFilters,
                isPublic: checked ? true : undefined
              })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleResetFilters} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};