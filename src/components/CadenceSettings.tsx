
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save } from 'lucide-react';

interface CadenceSetting {
  id: string;
  target_tier: string;
  default_cadence_days: number;
  description?: string;
}

const tierDisplayNames: Record<string, string> = {
  'VIP_Conversion': 'VIP Conversion',
  'VIP_Expansion': 'VIP Expansion',
  'Revenue_Protection': 'Revenue Protection',
  'Growth_Expansion': 'Growth Expansion',
  'Maintenance': 'Maintenance',
};

export default function CadenceSettings() {
  const [settings, setSettings] = useState<CadenceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_cadence_settings')
        .select('*')
        .order('target_tier');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch cadence settings',
          variant: 'destructive',
        });
        return;
      }

      setSettings(data || []);
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

  const updateSetting = async (id: string, newValue: number) => {
    if (newValue < 1) {
      toast({
        title: 'Invalid Value',
        description: 'Cadence days must be at least 1',
        variant: 'destructive',
      });
      return;
    }

    setSaving(id);
    try {
      const { error } = await supabase
        .from('visit_cadence_settings')
        .update({ 
          default_cadence_days: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update cadence setting',
          variant: 'destructive',
        });
        return;
      }

      setSettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, default_cadence_days: newValue }
            : setting
        )
      );

      toast({
        title: 'Success',
        description: 'Cadence setting updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleValueChange = (id: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setSettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, default_cadence_days: numValue }
            : setting
        )
      );
    }
  };

  const getCadenceDescription = (days: number) => {
    if (days <= 7) return 'Weekly';
    if (days <= 14) return 'Bi-weekly';
    if (days <= 30) return 'Monthly';
    if (days <= 60) return 'Bi-monthly';
    return 'Quarterly';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading cadence settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Visit Cadence Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how often to visit different target tiers
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {tierDisplayNames[setting.target_tier] || setting.target_tier}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getCadenceDescription(setting.default_cadence_days)} visits
                  </p>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`cadence-${setting.id}`} className="text-sm">
                      Every
                    </Label>
                    <Input
                      id={`cadence-${setting.id}`}
                      type="number"
                      min="1"
                      max="365"
                      value={setting.default_cadence_days}
                      onChange={(e) => handleValueChange(setting.id, e.target.value)}
                      className="w-16 text-center"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => updateSetting(setting.id, setting.default_cadence_days)}
                    disabled={saving === setting.id}
                    className="ml-2"
                  >
                    {saving === setting.id ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
