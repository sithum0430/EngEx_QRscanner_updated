import { useState, useEffect } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { BuildingSelector } from '@/components/BuildingSelector';
import { ActionToggle } from '@/components/ActionToggle';
import { ScanResult } from '@/components/ScanResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import uopLogo from '@/assets/uop-logo.png';
import engexLogo from '@/assets/engex-logo.png';
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
      // Placeholder buildings - will be replaced with your actual data
      const mockBuildings = [
        { id: '1', name: 'Engineering Faculty' },
        { id: '2', name: 'Science Faculty' },
        { id: '3', name: 'Arts Faculty' },
        { id: '4', name: 'Medical Faculty' },
        { id: '5', name: 'Agriculture Faculty' },
      ];
      setBuildings(mockBuildings);
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
      // This will work with your existing database schema
      // For now, we'll simulate the save operation
      console.log('Saving entry:', {
        qr_value: scanResult.qrValue,
        building_id: selectedBuilding,
        action: action,
        timestamp: new Date().toISOString(),
        scanned_by: 'mobile_app',
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Will integrate with your actual database when schema is provided

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
    <div className="min-h-screen bg-background p-4">
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