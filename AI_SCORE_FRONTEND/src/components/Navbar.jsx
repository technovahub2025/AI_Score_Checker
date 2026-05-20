import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoonStar, SunMedium, SquareArrowOutUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Tips', href: '/#tips' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'History', href: '/history' }
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
      <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3 sm:px-6 md:gap-5 lg:px-8 xl:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Technova Hub"
            className="h-11 w-11 rounded-2xl border border-border object-cover shadow-[0_10px_24px_rgba(34,24,56,0.08)]"
          />
          <div className="hidden sm:block">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-text-muted">AI Visibility</p>
            <h1 className="text-[0.95rem] font-semibold text-text">Technova Hub</h1>
          </div>
        </Link>

        <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 md:justify-center">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-text-muted transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:text-text hover:shadow-[0_10px_22px_rgba(139,92,246,0.08)] sm:px-4 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-surface text-text transition duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:shadow-[0_10px_24px_rgba(34,211,238,0.12)]"
          >
            {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>

          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(139,92,246,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(139,92,246,0.34)]"
          >
            Try free
            <SquareArrowOutUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
