import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { analyzeScan, fetchHistoryPage, fetchScanById, getScanById } from '../services/api';

const ScansContext = createContext(null);

export const ScansProvider = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);
  const createScan = useCallback(async (payload) => {
    const scan = await analyzeScan(payload);
    setRefreshToken((current) => current + 1);
    return scan;
  }, []);

  const getHistoryPage = useCallback(async (page, limit) => fetchHistoryPage(page, limit), []);

  const getScanByIdRemote = useCallback(async (id) => fetchScanById(id), []);

  const value = useMemo(
    () => ({
      refreshToken,
      createScan,
      getHistoryPage,
      getScanByIdRemote,
      getScanById
    }),
    [createScan, getHistoryPage, getScanByIdRemote, refreshToken]
  );

  return <ScansContext.Provider value={value}>{children}</ScansContext.Provider>;
};

export const useScans = () => {
  const context = useContext(ScansContext);
  if (!context) {
    throw new Error('useScans must be used within ScansProvider');
  }
  return context;
};
