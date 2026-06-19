import { useMemo, useState } from 'react';
import { LoaderCircle, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useScan from '../hooks/useScan';
import { normalizeScanUrl } from '../utils/formatters';
import { hoverLift, pressScale, sectionReveal } from '../utils/motion';

// Frontend URL normalization for display and basic validation
const normalizeFrontendUrl = (input) => {
  // Trim whitespace
  let url = String(input || '').trim();

  // Return empty if empty
  if (!url) return '';

  // Strip markdown link format like [text](url) and extract the URL
  const markdownMatch = url.match(/\[[^\]]*]\(([^)]+)\)/);
  if (markdownMatch) {
    url = markdownMatch[1];
  }

  // Prepend https:// if no protocol is present
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Try to parse as URL for basic validation
  try {
    const parsed = new URL(url);
    
    // Strip www. from hostname for comparison purposes
    const hostname = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname || '/';
    
    // Reconstruct with normalized hostname
    parsed.hostname = hostname;
    parsed.pathname = pathname;
    
    return parsed.toString();
  } catch (error) {
    // Invalid URL
    return '';
  }
};

const QuickScanCard = () => {
  const [url, setUrl] = useState('');
  const { loading, error, setError, submit } = useScan();

  // Use our frontend normalization for UI hint and basic validation
  const normalizedUrl = useMemo(() => normalizeFrontendUrl(url), [url]);
  
  // Additional validation: must have a dot in hostname and not be just https://
  const isValidFormat = useMemo(() => {
    if (!normalizedUrl) return false;
    try {
      const urlObj = new URL(normalizedUrl);
      const hostname = urlObj.hostname;
      // Must have at least one dot in hostname and not be just "https://"
      return hostname.includes('.') && hostname.length > 4;
    } catch (e) {
      return false;
    }
  }, [normalizedUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = normalizeFrontendUrl(url);
    if (!normalized) {
      setError('Please enter a valid URL');
      return;
    }
    
    // Additional validation
    try {
      const urlObj = new URL(normalized);
      const hostname = urlObj.hostname;
      if (!hostname.includes('.') || hostname.length <= 4) {
        setError('Please enter a valid domain name');
        return;
      }
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }
    
    await submit({
      input: normalized
    });
  };

  return (
    <motion.div
      id="quick-scan"
      {...hoverLift}
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="relative scroll-mt-28 overflow-hidden glass-panel rounded-[1.6rem] p-5 will-change-transform md:scroll-mt-32"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.2, scale: 0.98 }}
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [0.98, 1.01, 0.98] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-[1.6rem] bg-gradient-to-br from-accent-purple/8 via-transparent to-accent-cyan/8"
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Quick scan</p>
          <h3 className="mt-1 text-lg font-semibold text-text">Try a URL</h3>
        </div>
        <div className="rounded-full bg-accent-purple/10 px-3 py-1 text-xs font-semibold text-accent-purple">
          5 dimensions
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-[1.4rem] border border-border bg-bg-elevated p-4">
        <label className="grid gap-2">
          <span className="sr-only">Website URL</span>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surfaceStrong px-4 py-3 focus-within:border-accent-purple/25 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]">
            <Globe2 className="h-5 w-5 shrink-0 text-accent-purple" />
            <input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError('');
              }}
              placeholder="yourbrand.com or https://yourbrand.com"
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
            />
          </div>
        </label>
        <p className="mt-4 text-xs text-text-muted">Enter a domain name or https URL. Plain text won&apos;t score.</p>
        
        {/* Show normalized URL as hint */}
        {normalizedUrl && !loading && (
          <p className="mt-2 text-xs text-text-muted truncate">
            We&apos;ll scan: <span className="font-mono text-text">{normalizedUrl}</span>
          </p>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <motion.button
          {...pressScale}
          type="submit"
          disabled={!isValidFormat || loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(139,92,246,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
          {loading ? 'Analyzing' : 'Analyze now'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default QuickScanCard;
