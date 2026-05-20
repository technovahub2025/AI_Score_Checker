import { useMemo, useRef, useState } from 'react';
import { UploadCloud, FileText, Globe2, LoaderCircle } from 'lucide-react';
import useScan from '../hooks/useScan';
import ErrorState from '../components/ErrorState';
import { formatFileSize } from '../utils/file';
import { sanitizeInput } from '../utils/formatters';

const ScanPage = () => {
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

  return (
    <div className="grid w-full gap-6">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Technova Hub</p>
          <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">Run a new scan</h1>
          <p className="mt-3 text-sm leading-7 text-text-muted">
            Check a URL or paste content. You can also add a PDF, JPG, or PNG to enrich the analysis.
          </p>
        </div>

        <div className="mt-6 inline-flex rounded-full border border-border bg-surfaceStrong p-1 shadow-[0_10px_25px_rgba(24,18,44,0.05)]">
          {['url', 'text'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={[
                'rounded-full px-5 py-2 text-sm font-medium transition duration-300',
                tab === item ? 'bg-bg-elevated text-text shadow-[0_10px_20px_rgba(24,18,44,0.08)]' : 'text-text-muted'
              ].join(' ')}
            >
              {item === 'url' ? 'URL' : 'Text'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          {tab === 'url' ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-text-muted">Website URL</span>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-elevated px-4 py-3 focus-within:border-accent-purple/25 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]">
                <Globe2 className="h-5 w-5 shrink-0 text-accent-purple" />
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://yourbrand.com"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
              </div>
            </label>
          ) : (
            <label className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-text-muted">Paste content</span>
                <span className="text-xs text-text-muted">{sanitizeInput(text).length}/50</span>
              </div>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste at least 50 characters of marketing copy, product text, or a landing page section."
                rows={9}
                className="min-h-56 rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-accent-purple/25 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
              />
            </label>
          )}

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
              dragging ? 'border-accent-cyan bg-accent-cyan/10' : 'border-border bg-bg-elevated hover:-translate-y-0.5'
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
            {file ? <p className="text-xs text-text-muted">{file.name} - {formatFileSize(file.size)}</p> : null}
          </div>

          {error ? <ErrorState message={error} onRetry={() => setError('')} /> : null}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.24)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
            Analyze Now
          </button>
        </form>
      </section>

      {loading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(245,240,232,0.75)] px-4 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl px-8 py-7 text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-accent-purple" />
            <p className="mt-4 text-lg font-medium text-text">Analyzing your content...</p>
            <p className="mt-2 text-sm text-text-muted">Preparing your score report.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ScanPage;
