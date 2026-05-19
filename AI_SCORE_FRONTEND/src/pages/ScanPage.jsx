import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../services/api';
import useScan from '../hooks/useScan';
import ErrorState from '../components/ErrorState';
import { sanitizeInput } from '../utils/formatters';

const ScanPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('url');
  const [inputUrl, setInputUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { loading, error, setError, submit } = useScan();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'url') {
        return await submit({ inputType: 'url', inputUrl: sanitizeInput(inputUrl, false) });
      }

      return await submit({ inputType: 'text', inputText: sanitizeInput(inputText) });
    } catch (error) {
      return null;
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setFileError('');
      setUploading(true);
      const result = await uploadFile(file);
      navigate(`/results/${result._id}`);
    } catch (err) {
      setFileError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  if (loading || uploading) {
    return (
      <section className="page centered-state">
        <div className="spinner" />
        <h2>Analyzing your content...</h2>
        <p className="muted">Please wait while we score structure, clarity, and visibility signals.</p>
      </section>
    );
  }

  return (
    <div className="page scan-page">
      <section className="card form-card">
        <div className="section-heading">
          <h1>Run a new scan</h1>
          <p className="muted">Choose a URL, paste text, or upload a PDF for analysis.</p>
        </div>

        <div className="tab-switcher" role="tablist" aria-label="scan mode">
          <button
            type="button"
            className={mode === 'url' ? 'tab active' : 'tab'}
            onClick={() => setMode('url')}
          >
            URL
          </button>
          <button
            type="button"
            className={mode === 'text' ? 'tab active' : 'tab'}
            onClick={() => setMode('text')}
          >
            Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="scan-form">
          {mode === 'url' ? (
            <label className="field">
              <span>Website URL</span>
              <input
                type="url"
                placeholder="https://yourbrand.com"
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                required
              />
            </label>
          ) : (
            <label className="field">
              <div className="field-head">
                <span>Text input</span>
                <span className="muted">{inputText.trim().length}/50</span>
              </div>
              <textarea
                rows="10"
                placeholder="Paste at least 50 characters of marketing copy, landing page text, or product messaging."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                minLength={50}
                required
              />
            </label>
          )}

          {error ? <ErrorState message={error} onRetry={() => setError('')} /> : null}
          {fileError ? <ErrorState message={fileError} onRetry={() => setFileError('')} /> : null}

          <div
            className="upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <strong>Upload a PDF, JPG, or PNG</strong>
            <p className="muted">Drag and drop a file here, or click to browse.</p>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || uploading}>
            Analyze Now
          </button>
        </form>
      </section>
    </div>
  );
};

export default ScanPage;
