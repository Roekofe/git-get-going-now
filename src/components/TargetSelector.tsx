
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Calendar, MapPin } from 'lucide-react';

interface AvailableTarget {
  target_id: string;
  dispensary_name: string;
  banner: string;
  target_tier: string;
  priority_score: number;
  total_sales_ytd: number;
  smokiez_share_percent: number;
  trend_classification: string;
  percent_change_ytd: number;
  is_vip: boolean;
  converted: boolean;
  dispensary_id: string;
  survey_name: string;
  hoodie_id: string;
  verified_license: string;
  match_confidence: number;
  target_rationale: string;
  visit_status: string;
  effective_cadence_days: number;
  custom_cadence_days: number | null;
  last_visit_date: string | null;
  next_due_date: string | null;
  cadence_status: string;
  days_until_due: number;
  // Geographic information
  address: string | null;
  city: string | null;
  county: string | null;
  region: string | null;
}

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

interface TargetSelectorProps {
  onSelect: (dispensary: Dispensary) => void;
  selectedDispensary?: Dispensary | null;
}

export default function TargetSelector({ onSelect, selectedDispensary }: TargetSelectorProps) {
  const [targets, setTargets] = useState<AvailableTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vip');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['all']);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('available_targets')
        .select('*')
        .not('dispensary_id', 'is', null)
        .order('priority_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching targets:', error);
        return;
      }

      const targetsData = data || [];
      setTargets(targetsData);

      // Extract unique regions for filter dropdown
      const regions = [...new Set(targetsData
        .map(t => t.region)
        .filter(r => r && r !== 'Other Oregon')
        .sort()
      )];
      setAvailableRegions(regions);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetSelect = async (target: AvailableTarget) => {
    // Fetch the full dispensary record
    const { data, error } = await supabase
      .from('dispensaries')
      .select('*')
      .eq('id', target.dispensary_id)
      .single();

    if (error) {
      console.error('Error fetching dispensary:', error);
      return;
    }

    onSelect(data);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'VIP_Conversion':
      case 'VIP_Expansion':
        return <Target className="h-4 w-4" />;
      case 'Revenue_Protection':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Growth_Expansion':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP_Conversion':
        return 'bg-red-500 text-white';
      case 'VIP_Expansion':
        return 'bg-orange-500 text-white';
      case 'Revenue_Protection':
        return 'bg-yellow-500 text-black';
      case 'Growth_Expansion':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCadence = (days: number) => {
    if (days === 7) return 'Weekly';
    if (days === 14) return 'Bi-weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    if (days < 7) return `${days}d`;
    if (days % 7 === 0) return `${days / 7}w`;
    return `${days}d`;
  };

  const getCadenceStatusColor = (status: string) => {
    switch (status) {
      case 'Due for visit':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Due soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Filter targets by selected regions
  const filteredTargets = targets.filter(target => {
    if (selectedRegions.includes('all')) return true;
    return target.region && selectedRegions.includes(target.region);
  });

  const vipTargets = filteredTargets.filter(t => t.target_tier.startsWith('VIP'));
  const protectionTargets = filteredTargets.filter(t => t.target_tier === 'Revenue_Protection');
  const growthTargets = filteredTargets.filter(t => t.target_tier === 'Growth_Expansion');
  const maintenanceTargets = filteredTargets.filter(t => t.target_tier === 'Maintenance');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading priority targets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Priority Targets ({filteredTargets.length} of {targets.length} available)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Data-driven dispensary targets based on VIP status, sales trends, and revenue opportunities
        </p>

        {/* Region Filter */}
        <div className="flex items-center gap-2 mt-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Region:</span>
          <Select
            value={selectedRegions[0] || 'all'}
            onValueChange={(value) => setSelectedRegions(value === 'all' ? ['all'] : [value])}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Oregon</SelectItem>
              {availableRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vip" className="text-xs">
              VIP ({vipTargets.length})
            </TabsTrigger>
            <TabsTrigger value="protection" className="text-xs">
              Protect ({protectionTargets.length})
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-xs">
              Grow ({growthTargets.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">
              Maintain ({maintenanceTargets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vip" className="space-y-3 mt-4">
            {vipTargets.length === 0 ? (
              <p className="text-sm text-gray-500">No VIP targets available for visits</p>
            ) : (
              vipTargets.map((target) => (
                <Card key={target.target_id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-sm">{target.dispensary_name}</h3>
                        <p className="text-xs text-gray-500">{target.banner}</p>
                        {target.city && target.region && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {target.city}, {target.region}
                          </p>
                        )}
                      </div>
                      <Badge className={getTierColor(target.target_tier)}>
                        {getTierIcon(target.target_tier)}
                        <span className="ml-1">Priority {target.priority_score}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="font-medium">YTD Sales:</span> {formatCurrency(target.total_sales_ytd)}
                      </div>
                      <div>
                        <span className="font-medium">Smokiez Share:</span> {target.smokiez_share_percent?.toFixed(1) || 0}%
                      </div>
                    </div>

                    {target.effective_cadence_days && (
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Cadence: {formatCadence(target.effective_cadence_days)}</span>
                          {target.custom_cadence_days && (
                            <Badge variant="outline" className="text-xs px-1 py-0">Custom</Badge>
                          )}
                        </div>
                        {target.cadence_status && (
                          <Badge className={getCadenceStatusColor(target.cadence_status)} variant="outline">
                            {target.cadence_status}
                          </Badge>
                        )}
                      </div>
                    )}

                    {target.next_due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>Next due: {new Date(target.next_due_date).toLocaleDateString()}</span>
                        {target.days_until_due > 0 && (
                          <span>({target.days_until_due} days)</span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-600 mb-3">{target.target_rationale}</p>

                    <Button
                      size="sm"
                      onClick={() => handleTargetSelect(target)}
                      className="w-full"
                      variant={selectedDispensary?.id === target.dispensary_id ? "default" : "outline"}
                    >
                      {selectedDispensary?.id === target.dispensary_id ? "Selected" : "Select for Visit"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="protection" className="space-y-3 mt-4">
            {protectionTargets.map((target) => (
              <Card key={target.target_id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{target.dispensary_name}</h3>
                      <p className="text-xs text-gray-500">{target.banner}</p>
                      {target.city && target.region && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {target.city}, {target.region}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">
                        {target.percent_change_ytd?.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="font-medium">YTD Sales:</span> {formatCurrency(target.total_sales_ytd)}
                    </div>
                    <div>
                      <span className="font-medium">Trend:</span> {target.trend_classification}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{target.target_rationale}</p>

                  <Button
                    size="sm"
                    onClick={() => handleTargetSelect(target)}
                    className="w-full"
                    variant={selectedDispensary?.id === target.dispensary_id ? "default" : "outline"}
                  >
                    {selectedDispensary?.id === target.dispensary_id ? "Selected" : "Select for Visit"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="growth" className="space-y-3 mt-4">
            {growthTargets.map((target) => (
              <Card key={target.target_id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{target.dispensary_name}</h3>
                      <p className="text-xs text-gray-500">{target.banner}</p>
                      {target.city && target.region && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {target.city}, {target.region}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">
                        +{target.percent_change_ytd?.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="font-medium">YTD Sales:</span> {formatCurrency(target.total_sales_ytd)}
                    </div>
                    <div>
                      <span className="font-medium">Share:</span> {target.smokiez_share_percent?.toFixed(1) || 0}%
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{target.target_rationale}</p>

                  <Button
                    size="sm"
                    onClick={() => handleTargetSelect(target)}
                    className="w-full"
                    variant={selectedDispensary?.id === target.dispensary_id ? "default" : "outline"}
                  >
                    {selectedDispensary?.id === target.dispensary_id ? "Selected" : "Select for Visit"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-3 mt-4">
            {maintenanceTargets.map((target) => (
              <Card key={target.target_id} className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{target.dispensary_name}</h3>
                      <p className="text-xs text-gray-500">{target.banner}</p>
                      {target.city && target.region && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {target.city}, {target.region}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Stable
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="font-medium">YTD Sales:</span> {formatCurrency(target.total_sales_ytd)}
                    </div>
                    <div>
                      <span className="font-medium">Trend:</span> {target.trend_classification}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleTargetSelect(target)}
                    className="w-full"
                    variant={selectedDispensary?.id === target.dispensary_id ? "default" : "outline"}
                  >
                    {selectedDispensary?.id === target.dispensary_id ? "Selected" : "Select for Visit"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
