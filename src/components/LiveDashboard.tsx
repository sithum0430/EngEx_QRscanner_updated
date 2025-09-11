import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Building } from 'lucide-react';

interface BuildingCount {
  building_id: string;
  building_name: string;
  people_inside: number;
}

interface LiveDashboardProps {
  onRefresh: () => void;
  loading?: boolean;
  data: BuildingCount[];
}

export const LiveDashboard = ({ onRefresh, loading = false, data }: LiveDashboardProps) => {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
  }, [data]);

  const totalPeople = data.reduce((sum, building) => sum + building.people_inside, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Live Crowd Dashboard
            </span>
            <Button 
              onClick={onRefresh} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Count Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total People</p>
                    <p className="text-2xl font-bold text-primary">{totalPeople}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Building Cards */}
            {data.map((building) => (
              <Card key={building.building_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {building.building_name}
                      </p>
                      <p className="text-xl font-bold">{building.people_inside}</p>
                    </div>
                    <Building className="w-6 h-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Last updated: {lastUpdate}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};