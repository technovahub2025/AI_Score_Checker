import { Suspense, lazy, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import SkeletonLoader from './components/SkeletonLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const routes = useMemo(
    () => (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<Navigate to="/#quick-scan" replace />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    ),
    [location]
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-text transition-colors duration-300">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8 xl:px-10"
        >
          <Suspense fallback={<SkeletonLoader />}>{routes}</Suspense>
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default App;
