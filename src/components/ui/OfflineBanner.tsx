import { useState, useEffect } from 'react';
import { WifiOff, Wifi }       from 'lucide-react';

const OfflineBanner = () => {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnline(true);
      setTimeout(() => setShowOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnline(false);
    };
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) return (
    <div className="fixed top-0 left-0 right-0 z-[999]
                      bg-amber-500 text-white px-4 py-2
                      flex items-center justify-center gap-2
                      text-sm font-medium shadow-md">
      <WifiOff size={16} />
      You are offline. Downloaded materials are still available.
    </div>
  );

  if (showOnline) return (
    <div className="fixed top-0 left-0 right-0 z-[999]
                      bg-green-500 text-white px-4 py-2
                      flex items-center justify-center gap-2
                      text-sm font-medium shadow-md">
      <Wifi size={16} />
      Back online. Syncing your progress...
    </div>
  );

  return null;
};

export default OfflineBanner;