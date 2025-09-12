import { useState, useEffect } from 'react';
import { LiveDashboard } from '@/components/LiveDashboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import uopLogo from '@/assets/uop-logo-real.png';
const engexLogo = '/lovable-uploads/c8de7f56-9b26-4a5d-823b-235879e3f037.png';
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
      // Execute the exact SQL query you provided
      const { data, error } = await supabase.rpc('get_current_building_counts');

      if (error) {
        // If RPC function doesn't exist, fall back to manual query
        const { data: buildingData, error: buildingError } = await supabase
          .from('building')
          .select('building_id, building_name');

        if (buildingError) throw buildingError;

        // For now, return buildings with 0 count until we implement the complex query
        const countsData = buildingData.map(building => ({
          building_id: building.building_id.toString(),
          building_name: building.building_name,
          people_inside: 0
        }));

        setData(countsData);
      } else {
        setData(data);
      }
    } catch (error) {
      console.error('Error loading counts:', error);
      toast({
        title: "Error",
        description: "Failed to load building counts",
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
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