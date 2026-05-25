import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MoonStar, SunMedium, SquareArrowOutUpRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';
import { pressScale } from '../utils/motion';

const navItems = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' }
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'sticky top-0 z-50 border-b border-border/70 backdrop-blur-2xl transition-all duration-300',
        scrolled ? 'shadow-[0_20px_45px_rgba(29,24,48,0.08)]' : ''
      ].join(' ')}
      style={{ background: 'color-mix(in srgb, var(--gh-bg-elevated) 88%, transparent)' }}
    >
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[auto_1fr_auto] md:gap-4 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="shrink-0 justify-self-start"
        >
          <Link to="/" className="flex items-center gap-3 self-start">
            <BrandLogo variant="header" />
          </Link>
        </motion.div>

        <nav className="order-3 hidden min-w-0 w-full flex-wrap items-center gap-2 md:order-none md:flex md:justify-center md:flex-nowrap md:overflow-visible">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hidden shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-xs text-text-muted transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:text-text hover:shadow-[0_10px_22px_rgba(139,92,246,0.08)] lg:inline-flex sm:px-4 sm:text-sm"
          >
            See how AI sees your brand
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-xs text-text-muted transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:text-text hover:shadow-[0_10px_22px_rgba(139,92,246,0.08)] sm:px-4 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 justify-self-end md:order-none md:self-auto">
          <motion.button
            {...pressScale}
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-text transition duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:shadow-[0_10px_24px_rgba(34,211,238,0.12)] sm:h-11 sm:w-11"
          >
            {isDark ? <SunMedium className="h-4 w-4 sm:h-5 sm:w-5" /> : <MoonStar className="h-4 w-4 sm:h-5 sm:w-5" />}
          </motion.button>

          <motion.div {...pressScale}>
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_32px_rgba(139,92,246,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(139,92,246,0.34)] sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <span className="hidden sm:inline">Try free</span>
              <span className="sm:hidden">Try</span>
              <SquareArrowOutUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </motion.div>

          <motion.button
            {...pressScale}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-text transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:shadow-[0_10px_24px_rgba(139,92,246,0.08)] md:hidden sm:h-11 sm:w-11"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={menuOpen ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden border-t border-border/70 md:hidden"
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-2 px-4 py-4 sm:px-6">
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMenuOpen(false);
            }}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-muted transition duration-300 hover:border-accent-purple/25 hover:text-text"
          >
            See how AI sees your brand
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-muted transition duration-300 hover:border-accent-purple/25 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
};

export default memo(Navbar);
