import { useState, useEffect } from 'react';
import { LiveDashboard } from '@/components/LiveDashboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import uopLogo from '@/assets/uop-logo.png';
import engexLogo from '@/assets/engex-logo.png';
import { QrCode } from 'lucide-react';

interface BuildingCount {
  building_id: string;
  building_name: string;
  people_inside: number;
}

export default function Dashboard() {
  const [data, setData] = useState<BuildingCount[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCounts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCounts = async () => {
    setLoading(true);
    try {
      // This will execute your PostgreSQL query when database is ready
      // For now, using mock data
      console.log('Would execute the SQL query for building counts');

      // Mock data for now - replace with actual data when your schema is ready
      const mockCounts = [
        { building_id: '1', building_name: 'Engineering Faculty', people_inside: 45 },
        { building_id: '2', building_name: 'Science Faculty', people_inside: 23 },
        { building_id: '3', building_name: 'Arts Faculty', people_inside: 12 },
        { building_id: '4', building_name: 'Medical Faculty', people_inside: 67 },
        { building_id: '5', building_name: 'Agriculture Faculty', people_inside: 34 },
      ];

      setData(mockCounts);
    } catch (error) {
      console.error('Error loading counts:', error);
      toast({
        title: "Error",
        description: "Failed to load building counts",
        variant: "destructive",
      });
      // Show mock data even on error for demo purposes
      setData([
        { building_id: '1', building_name: 'Engineering Faculty', people_inside: 45 },
        { building_id: '2', building_name: 'Science Faculty', people_inside: 23 },
        { building_id: '3', building_name: 'Arts Faculty', people_inside: 12 },
        { building_id: '4', building_name: 'Medical Faculty', people_inside: 67 },
        { building_id: '5', building_name: 'Agriculture Faculty', people_inside: 34 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            <img src={uopLogo} alt="University of Peradeniya" className="w-16 h-16" />
            <img src={engexLogo} alt="ENGEX Exhibition" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">ENGEX Live Dashboard</h1>
            <p className="text-muted-foreground">Real-time crowd monitoring for heatmap visualization</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Back to Scanner
          </Button>
        </div>

        {/* Live Dashboard */}
        <LiveDashboard
          data={data}
          onRefresh={loadCounts}
          loading={loading}
        />
      </div>
    </div>
  );
}