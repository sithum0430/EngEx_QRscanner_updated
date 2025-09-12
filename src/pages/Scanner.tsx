import { useState, useEffect } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { BuildingSelector } from '@/components/BuildingSelector';
import { ActionToggle } from '@/components/ActionToggle';
import { ScanResult } from '@/components/ScanResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
const uopLogo = '/lovable-uploads/f10da031-5557-4314-87a4-d1e1801714a1.png';
const engexLogo = '/lovable-uploads/c8de7f56-9b26-4a5d-823b-235879e3f037.png';
import { BarChart3 } from 'lucide-react';

interface Building {
  id: string;
  name: string;
}

export default function Scanner() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [action, setAction] = useState<'entry' | 'exit'>('entry');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<{
    qrValue: string;
    timestamp: string;
    saved: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('building')
        .select('building_id, building_name')
        .order('building_name');
      
      if (error) throw error;
      
      const formattedBuildings = data.map(building => ({
        id: building.building_id.toString(),
        name: building.building_name
      }));
      
      setBuildings(formattedBuildings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading buildings:', error);
      toast({
        title: "Error",
        description: "Failed to load buildings",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleScan = (qrValue: string) => {
    if (!selectedBuilding) {
      toast({
        title: "No Building Selected",
        description: "Please select a building before scanning",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toLocaleString();
    setScanResult({
      qrValue,
      timestamp,
      saved: false,
    });
    setScannerActive(false);

    toast({
      title: "QR Code Scanned",
      description: `Scanned: ${qrValue.substring(0, 20)}...`,
    });
  };

  const handleSave = async () => {
    if (!scanResult || !selectedBuilding) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('entryexitlog')
        .insert({
          qr_value: scanResult.qrValue,
          building_id: parseInt(selectedBuilding),
          action: action,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;

      setScanResult(prev => prev ? { ...prev, saved: true } : null);
      toast({
        title: "Entry Saved",
        description: `${action} recorded successfully`,
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setScanResult(null);
  };

  const selectedBuildingName = buildings.find(b => b.id === selectedBuilding)?.name || '';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            <img src={uopLogo} alt="University of Peradeniya" className="w-16 h-16" />
            <img src={engexLogo} alt="ENGEX Exhibition" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ENGEX Crowd Management</h1>
            <p className="text-muted-foreground">University of Peradeniya</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Dashboard
          </Button>
        </div>

        {/* Building Selector */}
        <BuildingSelector
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          onBuildingChange={setSelectedBuilding}
          loading={loading}
        />

        {/* Action Toggle */}
        <ActionToggle
          action={action}
          onActionChange={setAction}
        />

        {/* QR Scanner */}
        <QRScanner
          onScan={handleScan}
          isActive={scannerActive}
          onToggle={() => setScannerActive(!scannerActive)}
        />

        {/* Scan Result */}
        {scanResult && (
          <ScanResult
            qrValue={scanResult.qrValue}
            building={selectedBuildingName}
            action={action}
            timestamp={scanResult.timestamp}
            onSave={handleSave}
            onClear={handleClear}
            saving={saving}
            saved={scanResult.saved}
          />
        )}
      </div>
    </div>
  );
}