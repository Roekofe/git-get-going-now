
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';

interface Visit {
  id: string;
  visit_timestamp: string;
  visit_purpose: string;
  samples_given: string;
  estimated_cost: number;
  notes: string;
  analysis_status: string;
  dispensaries: {
    survey_display_name: string;
    hoodie_id: string;
  };
}

interface VisitHistoryProps {
  userEmail: string;
  refreshTrigger: number;
}

export default function VisitHistory({ userEmail, refreshTrigger }: VisitHistoryProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, [userEmail, refreshTrigger]);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          dispensaries (
            survey_display_name,
            hoodie_id
          )
        `)
        .eq('rep_email', userEmail)
        .order('visit_timestamp', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching visits:', error);
        return;
      }

      setVisits(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading visit history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Clock className="h-5 w-5" />
          Recent Visits ({visits.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No visits recorded yet. Start by recording your first dispensary visit!
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {visit.dispensaries?.survey_display_name}
                      </span>
                    </div>
                    <Badge className={getStatusColor(visit.analysis_status)}>
                      {visit.analysis_status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(visit.visit_timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className="capitalize">
                        {visit.visit_purpose.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {visit.samples_given && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Package className="h-3 w-3" />
                      <span>Samples: {visit.samples_given}</span>
                    </div>
                  )}

                  {visit.estimated_cost && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <DollarSign className="h-3 w-3" />
                      <span>Est. Cost: ${visit.estimated_cost}</span>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {visit.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
