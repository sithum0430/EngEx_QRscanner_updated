import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const QRScanner = ({ onScan, isActive, onToggle }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [reader, setReader] = useState<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    const qrReader = new BrowserQRCodeReader();
    setReader(qrReader);

    return () => {
      qrReader.reset();
    };
  }, []);

  useEffect(() => {
    if (!reader || !videoRef.current) return;

    if (isActive) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isActive, reader]);

  const startScanning = async () => {
    if (!reader || !videoRef.current) return;

    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      videoRef.current.srcObject = stream;
      
      reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          onScan(result.getText());
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('QR Scanner error:', error);
        }
      });
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  };

  const stopScanning = () => {
    if (!reader || !videoRef.current) return;

    reader.reset();
    
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          QR Scanner
          <Button
            onClick={onToggle}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isActive ? 'Stop' : 'Start'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground text-center">
                Tap Start to begin scanning QR codes
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};