
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Shield, Target } from 'lucide-react';

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

interface AvailableTarget {
  target_id: string;
  dispensary_id: string;
  dispensary_name: string;
  target_tier: string;
  priority_score: number;
  total_sales_ytd: number;
  smokiez_share_percent: number;
  trend_classification: string;
  target_rationale: string;
  converted: boolean;
  is_vip: boolean;
}

interface TargetSelectorProps {
  onSelect: (dispensary: Dispensary) => void;
  selectedDispensary?: Dispensary | null;
}

export default function TargetSelector({ onSelect, selectedDispensary }: TargetSelectorProps) {
  const [targets, setTargets] = useState<AvailableTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const { data, error } = await supabase
        .from('available_targets')
        .select('*')
        .not('dispensary_id', 'is', null)
        .order('priority_score', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch priority targets',
          variant: 'destructive',
        });
        return;
      }

      setTargets(data || []);
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

  const handleTargetSelect = async (target: AvailableTarget) => {
    try {
      const { data: dispensary, error } = await supabase
        .from('dispensaries')
        .select('*')
        .eq('id', target.dispensary_id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch dispensary details',
          variant: 'destructive',
        });
        return;
      }

      onSelect(dispensary);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const getTargetsByTier = (tier: string) => {
    return targets.filter(target => target.target_tier === tier);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Growing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Decaying':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };

  const TargetCard = ({ target }: { target: AvailableTarget }) => {
    const isSelected = selectedDispensary?.id === target.dispensary_id;
    
    return (
      <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{target.dispensary_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                {getTrendIcon(target.trend_classification)}
                <Badge variant="outline" className="text-xs">
                  Score: {target.priority_score}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
            <div>YTD Sales: {formatCurrency(target.total_sales_ytd || 0)}</div>
            <div>Share: {target.smokiez_share_percent?.toFixed(1) || 0}%</div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {target.target_rationale}
          </p>
          
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className="w-full"
            onClick={() => handleTargetSelect(target)}
          >
            {isSelected ? 'Selected' : 'Select Target'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading priority targets...</div>
        </CardContent>
      </Card>
    );
  }

  const vipTargets = getTargetsByTier('VIP_Conversion').concat(getTargetsByTier('VIP_Expansion'));
  const protectionTargets = getTargetsByTier('Revenue_Protection');
  const growthTargets = getTargetsByTier('Growth_Expansion');
  const maintenanceTargets = getTargetsByTier('Maintenance');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Priority Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vip" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vip" className="text-xs">
              VIP ({vipTargets.length})
            </TabsTrigger>
            <TabsTrigger value="protection" className="text-xs">
              Protection ({protectionTargets.length})
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-xs">
              Growth ({growthTargets.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">
              Maintenance ({maintenanceTargets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vip" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {vipTargets.length > 0 ? (
                vipTargets.map((target) => (
                  <TargetCard key={target.target_id} target={target} />
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No VIP targets available
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="protection" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {protectionTargets.length > 0 ? (
                protectionTargets.map((target) => (
                  <TargetCard key={target.target_id} target={target} />
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No revenue protection targets available
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="growth" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {growthTargets.length > 0 ? (
                growthTargets.map((target) => (
                  <TargetCard key={target.target_id} target={target} />
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No growth expansion targets available
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {maintenanceTargets.length > 0 ? (
                maintenanceTargets.map((target) => (
                  <TargetCard key={target.target_id} target={target} />
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No maintenance targets available
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
