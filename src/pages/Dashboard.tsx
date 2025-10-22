import { useState, useEffect } from 'react';
import { LiveDashboard } from '@/components/LiveDashboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
const uopLogo = '/lovable-uploads/f10da031-5557-4314-87a4-d1e1801714a1.png';
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
      // Try server RPC-like endpoint first; fallback computes counts client-side
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/building-counts`);
      if (res.ok) {
        const json = await res.json();
        setData(json as BuildingCount[]);
      } else {
        // Fallback: fetch buildings and logs then compute
        const bRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/buildings`);
        if (!bRes.ok) throw new Error('Failed to fetch buildings');
        const buildingData = await bRes.json();

        const lRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/logs`);
        if (!lRes.ok) throw new Error('Failed to fetch logs');
        const logs = await lRes.json();

        const latestMap = new Map<string, string>();
        for (const log of logs as any[]) {
          const key = `${log.building_id}|${log.qr_value}`;
          if (!latestMap.has(key)) {
            latestMap.set(key, log.action);
          }
        }

        const countsData = (buildingData as any[]).map((b) => {
          let count = 0;
          latestMap.forEach((action, key) => {
            const [bid] = key.split('|');
            if (Number(bid) === b.building_id && action === 'entry') count++;
          });
          return {
            building_id: b.building_id.toString(),
            building_name: b.building_name,
            people_inside: count,
          } as BuildingCount;
        });

        setData(countsData);
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
            <h1 className="text-3xl font-bold text-primary drop-shadow">EngEx Live Dashboard</h1>
            <p className="text-primary-foreground/80">Real-time crowd monitoring for heatmap visualization</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            variant="default"
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