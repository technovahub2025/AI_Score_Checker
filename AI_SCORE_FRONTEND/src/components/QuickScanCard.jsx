import { useMemo, useRef, useState } from 'react';
import { LoaderCircle, UploadCloud, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useScan from '../hooks/useScan';
import { formatFileSize } from '../utils/file';
import { sanitizeInput } from '../utils/formatters';

const QuickScanCard = () => {
  const [tab, setTab] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const { loading, error, setError, submit } = useScan();

  const isValid = useMemo(() => {
    if (file) return true;
    if (tab === 'url') return /^https?:\/\/.+/i.test(url.trim());
    return sanitizeInput(text).length >= 50;
  }, [file, tab, url, text]);

  const onFileSelect = (selected) => {
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) return;
    await submit({
      mode: tab,
      input: sanitizeInput(tab === 'url' ? url : text, tab === 'url'),
      file
    });
  };

  const tabButtonClass = (active) =>
    [
      'flex-1 rounded-full px-4 py-2 text-sm font-medium transition',
      active ? 'bg-bg-elevated text-text shadow-[0_10px_25px_rgba(24,18,44,0.08)]' : 'text-text-muted'
    ].join(' ');

  return (
    <motion.div
      id="quick-scan"
      whileHover={{ y: -4 }}
      className="glass-panel rounded-[1.6rem] p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Quick scan</p>
          <h3 className="mt-1 text-lg font-semibold text-text">Try a URL, text, or file</h3>
        </div>
        <div className="rounded-full bg-accent-purple/10 px-3 py-1 text-xs font-semibold text-accent-purple">
          5 dimensions
        </div>
      </div>

      <div className="inline-flex w-full rounded-full border border-border bg-surfaceStrong p-1">
        <button type="button" onClick={() => setTab('url')} className={tabButtonClass(tab === 'url')}>
          Check URL
        </button>
        <button type="button" onClick={() => setTab('text')} className={tabButtonClass(tab === 'text')}>
          Paste text
        </button>
        <button type="button" onClick={() => setTab('file')} className={tabButtonClass(tab === 'file')}>
          Upload file
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-[1.4rem] border border-border bg-bg-elevated p-4">
        {tab === 'url' ? (
          <>
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
                  placeholder="https://yourbrand.com"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
              </div>
            </label>
            <p className="mt-4 text-xs text-text-muted">Enter a URL starting with https://</p>
          </>
        ) : null}

        {tab === 'text' ? (
          <>
            <label className="grid gap-2">
              <span className="sr-only">Paste content</span>
              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError('');
                }}
                placeholder="Paste at least 50 characters of marketing copy, product text, or a landing page section."
                rows={6}
                className="min-h-44 rounded-2xl border border-border bg-surfaceStrong px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-accent-purple/25 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
              />
            </label>
            <p className="mt-4 text-xs text-text-muted">{sanitizeInput(text).length}/50 characters</p>
          </>
        ) : null}

        {tab === 'file' ? (
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              onFileSelect(event.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            className={[
              'grid cursor-pointer place-items-center gap-3 rounded-3xl border border-dashed p-6 text-center transition duration-300',
              dragging ? 'border-accent-cyan bg-accent-cyan/10' : 'border-border bg-surfaceStrong hover:-translate-y-0.5'
            ].join(' ')}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(event) => onFileSelect(event.target.files?.[0])}
            />
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 text-accent-purple">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-text">Upload a PDF, JPG, or PNG</p>
              <p className="mt-1 text-sm text-text-muted">Drag and drop a file here or click to browse.</p>
            </div>
            {file ? (
              <p className="text-xs text-text-muted">
                {file.name} - {formatFileSize(file.size)}
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(139,92,246,0.24)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
          Analyze now
        </button>
      </form>
    </motion.div>
  );
};

export default QuickScanCard;
