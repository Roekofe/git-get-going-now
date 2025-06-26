
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, History, User } from 'lucide-react';
import VisitForm from './VisitForm';
import VisitHistory from './VisitHistory';
import { useToast } from '@/hooks/use-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardProps {
  user: SupabaseUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleVisitSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-green-800">
                Dispensary Survey App
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="new-visit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new-visit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Visit
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-visit">
            <VisitForm 
              userEmail={user.email || ''} 
              onSubmitSuccess={handleVisitSubmitted}
            />
          </TabsContent>

          <TabsContent value="history">
            <VisitHistory 
              userEmail={user.email || ''} 
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
