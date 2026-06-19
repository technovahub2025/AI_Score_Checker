import { Suspense, lazy, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import SkeletonLoader from './components/SkeletonLoader';
import { pageMotion } from './utils/motion';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Keepalive to prevent cold starts on Render
  useEffect(() => {
    const keepalive = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          console.warn('Keepalive request failed:', response.status);
        }
      } catch (error) {
        console.warn('Keepalive request error:', error);
      }
    };

    // Call immediately on mount
    keepalive();

    // Set interval to call every 10 minutes (600000ms)
    const intervalId = setInterval(keepalive, 10 * 60 * 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const routes = useMemo(
    () => (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<Navigate to="/#quick-scan" replace />} />
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
          initial={pageMotion.initial}
          animate={pageMotion.animate}
          exit={pageMotion.exit}
          transition={pageMotion.transition}
          className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8 xl:px-10"
        >
          <Suspense fallback={<SkeletonLoader />}>{routes}</Suspense>
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default App;
