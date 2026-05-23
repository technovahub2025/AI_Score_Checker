import { createContext, useCallback, useContext, useMemo } from 'react';
import { analyzeScan, fetchScanById } from '../services/api';

const ScansContext = createContext(null);

export const ScansProvider = ({ children }) => {
  const createScan = useCallback(async (payload) => {
    return analyzeScan(payload);
  }, []);

  const getScanByIdRemote = useCallback(async (id) => fetchScanById(id), []);

  const value = useMemo(
    () => ({
      createScan,
      getScanByIdRemote
    }),
    [createScan, getScanByIdRemote]
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
