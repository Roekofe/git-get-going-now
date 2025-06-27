import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import DispensaryAutocomplete from './DispensaryAutocomplete';
import TargetSelector from './TargetSelector';
import { Save, Calendar, Target } from 'lucide-react';

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

interface VisitFormProps {
  userEmail: string;
  onSubmitSuccess: () => void;
}

export default function VisitForm({ userEmail, onSubmitSuccess }: VisitFormProps) {
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const [visitTimestamp, setVisitTimestamp] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [samplesGiven, setSamplesGiven] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDispensary) {
      toast({
        title: 'Error',
        description: 'Please select a dispensary',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('visits')
        .insert({
          dispensary_id: selectedDispensary.id,
          rep_email: userEmail,
          visit_timestamp: new Date(visitTimestamp).toISOString(),
          visit_purpose: visitPurpose,
          samples_given: samplesGiven,
          estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
          notes: notes,
        });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Visit recorded successfully',
        });
        
        // Reset form
        setSelectedDispensary(null);
        setVisitTimestamp('');
        setVisitPurpose('');
        setSamplesGiven('');
        setEstimatedCost('');
        setNotes('');
        
        onSubmitSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setVisitTimestamp(localDateTime.toISOString().slice(0, 16));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Save className="h-5 w-5" />
          Record Dispensary Visit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Priority Targets Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Target className="h-5 w-5" />
              <h3>Select from Priority Targets (Recommended)</h3>
            </div>
            <TargetSelector
              onSelect={setSelectedDispensary}
              selectedDispensary={selectedDispensary}
            />
          </div>

          {/* Divider with OR */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-sm text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Fallback Dispensary Search */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Search All Dispensaries</Label>
            <DispensaryAutocomplete
              onSelect={setSelectedDispensary}
              selectedDispensary={selectedDispensary}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-timestamp">Visit Date & Time *</Label>
            <div className="flex gap-2">
              <Input
                id="visit-timestamp"
                type="datetime-local"
                value={visitTimestamp}
                onChange={(e) => setVisitTimestamp(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={setCurrentDateTime}
                className="px-3"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-purpose">Visit Purpose *</Label>
            <Select value={visitPurpose} onValueChange={setVisitPurpose} required>
              <SelectTrigger>
                <SelectValue placeholder="Select visit purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product_demo">Product Demo</SelectItem>
                <SelectItem value="relationship_building">Relationship Building</SelectItem>
                <SelectItem value="sample_drop">Sample Drop</SelectItem>
                <SelectItem value="inventory_check">Inventory Check</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="feedback_collection">Feedback Collection</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="samples-given">Samples Given</Label>
            <Input
              id="samples-given"
              type="text"
              placeholder="e.g., 2x Gummies, 1x Vape Cartridge"
              value={samplesGiven}
              onChange={(e) => setSamplesGiven(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-cost">Estimated Cost ($)</Label>
            <Input
              id="estimated-cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the visit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Recording Visit...' : 'Record Visit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
