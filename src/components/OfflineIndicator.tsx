import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RotateCcw, Download } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();

  if (isOnline && !updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      {!isOnline && (
        <Alert className="mb-2 border-destructive/50 text-destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}
      
      {updateAvailable && (
        <Alert className="border-primary/50 text-primary">
          <Download className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>App update available</span>
            <Button
              size="sm"
              variant="outline"
              onClick={updateServiceWorker}
              className="ml-2 h-7"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Update
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};