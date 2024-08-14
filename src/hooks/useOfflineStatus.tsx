import { useState, useEffect } from 'react';

/**
 * This hook is used to check if the user is offline or not
 * @returns boolean
 * @example
 * const offline = useOfflineStatus();
 */
export const useOfflineStatus = () => {
  const [offline, setOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return offline;
}