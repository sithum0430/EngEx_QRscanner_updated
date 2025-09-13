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

      // Prefer HTTPS for camera APIs, but don't break local/private network access
      if (typeof window !== 'undefined') {
        const { protocol, hostname, pathname, search, hash } = window.location;
        const isLoopback = ['localhost', '127.0.0.1', '::1'].includes(hostname);
        const isPrivateIPv4 =
          /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
          /^192\.168\.\d+\.\d+$/.test(hostname) ||
          /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname);
        const isDev = import.meta.env.MODE !== 'production';
        const allowHttp = isLoopback || isPrivateIPv4 || isDev;
        if (protocol === 'http:' && !allowHttp) {
          window.location.replace(`https://${hostname}${pathname}${search}${hash}`);
          setError('Redirecting to secure HTTPS for camera access...');
          return;
        }
        if (!window.isSecureContext && !allowHttp) {
          setError('Camera requires a secure context (HTTPS). Please reopen the secure link.');
          return;
        }
        if (window.top !== window.self) {
          console.warn('Camera may be blocked in embedded view (iframe).');
        }
      }

      // Check if camera is available first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
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
      const e = err as DOMException & { message?: string };
      let message = 'Camera access denied or not available';
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        if (typeof window !== 'undefined') {
          if (window.top !== window.self) {
            message = 'Camera is blocked in embedded view. Tap "Open Fullscreen" below.';
          } else if (!window.isSecureContext) {
            message = 'Camera requires HTTPS. Please use the secure link.';
          } else {
            message = 'Please allow camera access in your browser settings and reload.';
          }
        }
      } else if (e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError') {
        message = 'No suitable camera found. Try switching to the back camera.';
      }
      setError(message);
      console.error('Camera error:', e);
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
          <div className="mt-2 space-y-2">
            <p className="text-destructive text-sm">{error}</p>
            {typeof window !== 'undefined' && window.top !== window.self && (
              <Button
                size="sm"
                variant="secondary"
                className="text-foreground"
                onClick={() => {
                  try {
                    window.open(window.location.href, '_blank', 'noopener,noreferrer');
                  } catch {}
                }}
              >
                Open Fullscreen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};