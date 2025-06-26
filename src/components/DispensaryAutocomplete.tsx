
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Dispensary {
  id: string;
  Survey_Display_Name: string;
  Hoodie_ID: string;
  Hoodie_License: string;
  Verified_License: string;
  OLCC_Business_Name: string;
  Match_Type: string;
  Verification_Notes: string;
  Confidence_Score: string;
  Is_Verified: string;
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
      setQuery(selectedDispensary.Survey_Display_Name || '');
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
          .ilike('Survey_Display_Name', `%${query}%`)
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
    setQuery(dispensary.Survey_Display_Name || '');
    setIsOpen(false);
    onSelect(dispensary);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear selection if user is typing something new
    if (selectedDispensary && value !== selectedDispensary.Survey_Display_Name) {
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
                {dispensary.Survey_Display_Name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dispensary.Hoodie_ID && (
                  <span>ID: {dispensary.Hoodie_ID}</span>
                )}
                {dispensary.Verified_License && (
                  <span className="ml-2">License: {dispensary.Verified_License}</span>
                )}
                {dispensary.OLCC_Business_Name && (
                  <div className="text-xs text-gray-400 mt-1">
                    OLCC: {dispensary.OLCC_Business_Name}
                  </div>
                )}
                {dispensary.Is_Verified === 'true' && (
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
