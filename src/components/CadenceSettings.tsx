
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save, Trash2, Settings } from 'lucide-react';

interface CadenceSetting {
  id: string;
  target_tier: string;
  default_cadence_days: number;
  description?: string;
}

interface CustomCadenceTarget {
  target_id: string;
  dispensary_name: string;
  target_tier: string;
  custom_cadence_days: number;
  effective_cadence_days: number;
  last_visit_date?: string;
  next_due_date?: string;
  visit_notes?: string;
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
  const [customTargets, setCustomTargets] = useState<CustomCadenceTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tier defaults
      const { data: settingsData, error: settingsError } = await supabase
        .from('visit_cadence_settings')
        .select('*')
        .order('target_tier');

      if (settingsError) {
        toast({
          title: 'Error',
          description: 'Failed to fetch cadence settings',
          variant: 'destructive',
        });
        return;
      }

      // Fetch custom cadences
      const { data: targets, error: targetsError } = await supabase
        .from('available_targets')
        .select(`
          target_id, dispensary_name, target_tier,
          custom_cadence_days, effective_cadence_days,
          last_visit_date, next_due_date, visit_notes
        `)
        .not('custom_cadence_days', 'is', null)
        .limit(50);

      if (targetsError) {
        toast({
          title: 'Error',
          description: 'Failed to fetch custom cadences',
          variant: 'destructive',
        });
        return;
      }

      setSettings(settingsData || []);
      setCustomTargets(targets || []);
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

  const updateCustomCadence = async (targetId: string, days: number | null, notes: string) => {
    setSaving(targetId);
    try {
      const { error } = await supabase
        .from('target_dispensaries')
        .update({
          custom_cadence_days: days,
          visit_notes: notes
        })
        .eq('id', targetId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update custom cadence',
          variant: 'destructive',
        });
        return;
      }

      // Refresh data to show updated values
      await fetchData();

      toast({
        title: 'Success',
        description: 'Custom cadence updated successfully',
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

  const removeCustomCadence = async (targetId: string) => {
    await updateCustomCadence(targetId, null, '');
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

  const handleCustomValueChange = (targetId: string, field: 'days' | 'notes', value: string | number) => {
    setCustomTargets(prev => 
      prev.map(target => 
        target.target_id === targetId 
          ? { 
              ...target, 
              [field === 'days' ? 'custom_cadence_days' : 'visit_notes']: value 
            }
          : target
      )
    );
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
            <Settings className="h-5 w-5" />
            Visit Cadence Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure visit frequencies for target tiers and individual locations
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tier-defaults" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tier-defaults">Tier Defaults</TabsTrigger>
              <TabsTrigger value="custom-cadences">Custom Cadences</TabsTrigger>
            </TabsList>

            <TabsContent value="tier-defaults" className="space-y-4 mt-6">
              <div className="space-y-4">
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
              </div>
            </TabsContent>

            <TabsContent value="custom-cadences" className="space-y-4 mt-6">
              {customTargets.length === 0 ? (
                <Card className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No custom cadences set</p>
                    <p className="text-sm mt-1">
                      Individual locations will use their tier defaults
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {customTargets.map((target) => (
                    <Card key={target.target_id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{target.dispensary_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tierDisplayNames[target.target_tier] || target.target_tier}
                            </p>
                            {target.next_due_date && (
                              <p className="text-xs text-muted-foreground">
                                Next due: {new Date(target.next_due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Every</Label>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              value={target.custom_cadence_days}
                              onChange={(e) => handleCustomValueChange(target.target_id, 'days', parseInt(e.target.value))}
                              className="w-16 text-center"
                            />
                            <span className="text-sm text-muted-foreground">days</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`notes-${target.target_id}`} className="text-sm">
                            Visit Notes
                          </Label>
                          <Textarea
                            id={`notes-${target.target_id}`}
                            value={target.visit_notes || ''}
                            onChange={(e) => handleCustomValueChange(target.target_id, 'notes', e.target.value)}
                            placeholder="Add notes about this location's visit schedule..."
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateCustomCadence(
                              target.target_id, 
                              target.custom_cadence_days, 
                              target.visit_notes || ''
                            )}
                            disabled={saving === target.target_id}
                          >
                            {saving === target.target_id ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCustomCadence(target.target_id)}
                            disabled={saving === target.target_id}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove Custom
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
