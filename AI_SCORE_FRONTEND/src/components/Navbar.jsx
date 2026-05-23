import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoonStar, SunMedium, SquareArrowOutUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

const navItems = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' }
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b border-border/70 backdrop-blur-2xl transition-all duration-300',
        scrolled ? 'shadow-[0_20px_45px_rgba(29,24,48,0.08)]' : ''
      ].join(' ')}
      style={{ background: 'color-mix(in srgb, var(--gh-bg-elevated) 88%, transparent)' }}
    >
      <div className="flex w-full flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:gap-5 lg:px-8 xl:px-10">
        <Link to="/" className="flex items-center gap-3 self-start">
          <BrandLogo variant="header" />
        </Link>

        <nav className="flex min-w-0 w-full flex-1 items-center gap-2 overflow-x-auto pb-1 md:justify-center md:overflow-visible md:pb-0">
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

        <div className="ml-auto flex shrink-0 items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-text transition duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:shadow-[0_10px_24px_rgba(34,211,238,0.12)] sm:h-11 sm:w-11"
          >
            {isDark ? <SunMedium className="h-4 w-4 sm:h-5 sm:w-5" /> : <MoonStar className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_32px_rgba(139,92,246,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(139,92,246,0.34)] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="hidden sm:inline">Try free</span>
            <span className="sm:hidden">Try</span>
            <SquareArrowOutUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
