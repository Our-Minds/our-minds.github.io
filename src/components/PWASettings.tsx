import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  RotateCcw,
  Bell,
  CheckCircle2
} from 'lucide-react';

export const PWASettings = () => {
  const { 
    isOnline, 
    isInstalled, 
    isInstallable, 
    updateAvailable, 
    updateServiceWorker, 
    reloadApp 
  } = usePWA();

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Our Minds', {
          body: 'Notifications are now enabled!',
          icon: '/assets/icon-192x192.png'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Progressive Web App
          </CardTitle>
          <CardDescription>
            Manage your app installation and offline capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Installation Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div>
                <p className="font-medium">Installation Status</p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled ? 'App is installed' : 'Running in browser'}
                </p>
              </div>
            </div>
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? 'Installed' : 'Browser'}
            </Badge>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-primary" />
              ) : (
                <WifiOff className="w-5 h-5 text-destructive" />
              )}
              <div>
                <p className="font-medium">Network Status</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Connected to internet' : 'Offline mode active'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {updateAvailable && (
              <Button 
                onClick={updateServiceWorker}
                className="w-full"
                variant="default"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Update App
              </Button>
            )}

            {!isInstalled && isInstallable && (
              <Button 
                onClick={() => window.dispatchEvent(new Event('beforeinstallprompt'))}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}

            <Button 
              onClick={requestNotificationPermission}
              className="w-full"
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>

            <Button 
              onClick={reloadApp}
              className="w-full"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload App
            </Button>
          </div>

          {/* Features */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">PWA Features</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Offline access to cached content</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Automatic app updates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Native app-like experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Push notifications support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};