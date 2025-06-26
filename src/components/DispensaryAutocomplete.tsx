
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Dispensary {
  id: string;
  survey_display_name: string;
  hoodie_id: string;
  verified_license: string;
  is_verified: string;
}

interface DispensaryAutocompleteProps {
  onSelect: (dispensary: Dispensary) => void;
  selectedDispensary?: Dispensary | null;
}

export default function DispensaryAutocomplete({ onSelect, selectedDispensary }: DispensaryAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedDispensary) {
      setQuery(selectedDispensary.survey_display_name || '');
    }
  }, [selectedDispensary]);

  useEffect(() => {
    const searchDispensaries = async () => {
      if (query.length < 3) {
        setDispensaries([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('dispensaries')
          .select('*')
          .ilike('survey_display_name', `%${query}%`)
          .limit(10);

        if (error) {
          console.error('Error searching dispensaries:', error);
          return;
        }

        setDispensaries(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchDispensaries, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (dispensary: Dispensary) => {
    setQuery(dispensary.survey_display_name || '');
    setIsOpen(false);
    onSelect(dispensary);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear selection if user is typing something new
    if (selectedDispensary && value !== selectedDispensary.survey_display_name) {
      onSelect(null as any);
    }
  };

  return (
    <div className="relative space-y-2">
      <Label htmlFor="dispensary-search">Dispensary *</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="dispensary-search"
          ref={inputRef}
          type="text"
          placeholder="Type at least 3 characters to search..."
          value={query}
          onChange={handleInputChange}
          className="pl-10"
          required
        />
      </div>
      
      {isOpen && dispensaries.length > 0 && (
        <Card className="absolute z-10 w-full max-h-60 overflow-y-auto border shadow-lg bg-white">
          {dispensaries.map((dispensary) => (
            <div
              key={dispensary.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(dispensary)}
            >
              <div className="font-medium text-sm">
                {dispensary.survey_display_name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ID: {dispensary.hoodie_id} | License: {dispensary.verified_license}
                {dispensary.is_verified === 'true' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
      
      {loading && (
        <div className="text-sm text-gray-500">Searching...</div>
      )}
    </div>
  );
}
