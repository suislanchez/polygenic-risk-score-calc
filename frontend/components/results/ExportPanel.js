'use client';

import { useState } from 'react';
import { generateCSV, formatDiseaseName } from '../../lib/chartConfig';

/**
 * Export Panel Component - Provides various export options
 */
export default function ExportPanel({ results, metadata }) {
  const [copyStatus, setCopyStatus] = useState('idle');
  const [downloadStatus, setDownloadStatus] = useState({
    pdf: 'idle',
    csv: 'idle',
  });

  /**
   * Download CSV file
   */
  const handleDownloadCSV = () => {
    if (!results) return;

    setDownloadStatus((prev) => ({ ...prev, csv: 'loading' }));

    try {
      const csvContent = generateCSV(results, metadata);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `prs-results-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadStatus((prev) => ({ ...prev, csv: 'success' }));
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, csv: 'idle' })), 2000);
    } catch (error) {
      console.error('CSV download error:', error);
      setDownloadStatus((prev) => ({ ...prev, csv: 'error' }));
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, csv: 'idle' })), 2000);
    }
  };

  /**
   * Download PDF (calls API endpoint)
   */
  const handleDownloadPDF = async () => {
    setDownloadStatus((prev) => ({ ...prev, pdf: 'loading' }));

    try {
      // For now, we'll generate a simple printable version
      // In a real implementation, this would call a PDF generation API
      window.print();
      setDownloadStatus((prev) => ({ ...prev, pdf: 'success' }));
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, pdf: 'idle' })), 2000);
    } catch (error) {
      console.error('PDF download error:', error);
      setDownloadStatus((prev) => ({ ...prev, pdf: 'error' }));
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, pdf: 'idle' })), 2000);
    }
  };

  /**
   * Copy shareable link to clipboard
   */
  const handleCopyLink = async () => {
    setCopyStatus('loading');

    try {
      // Create a shareable link with encoded results
      // Note: In production, you'd want to use a shorter URL service or store results server-side
      const shareData = {
        results: Object.entries(results).slice(0, 10).map(([disease, data]) => ({
          d: disease,
          p: Math.round(data.percentile),
          r: data.risk_category[0], // First letter of risk category
        })),
        a: metadata?.ancestry,
        t: Date.now(),
      };

      const encoded = btoa(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}/results?share=${encoded}`;

      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Copy link error:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  /**
   * Print-friendly view
   */
  const handlePrint = () => {
    window.print();
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#475569',
    transition: 'all 0.2s',
    minWidth: '140px',
  };

  const getStatusIcon = (status) => {
    if (status === 'loading') {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" opacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      );
    }
    if (status === 'success') {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (status === 'error') {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
      }}
    >
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <h3
        style={{
          margin: '0 0 16px',
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1e293b',
        }}
      >
        Export & Share
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloadStatus.pdf === 'loading'}
          style={{
            ...buttonStyle,
            background: downloadStatus.pdf === 'success' ? '#f0fdf4' : 'white',
            borderColor: downloadStatus.pdf === 'success' ? '#86efac' : '#e2e8f0',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.target.style.background =
              downloadStatus.pdf === 'success' ? '#f0fdf4' : 'white';
            e.target.style.borderColor =
              downloadStatus.pdf === 'success' ? '#86efac' : '#e2e8f0';
          }}
        >
          {getStatusIcon(downloadStatus.pdf) || (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          )}
          {downloadStatus.pdf === 'loading'
            ? 'Generating...'
            : downloadStatus.pdf === 'success'
            ? 'Opened!'
            : 'Print PDF'}
        </button>

        {/* Download CSV Button */}
        <button
          onClick={handleDownloadCSV}
          disabled={downloadStatus.csv === 'loading'}
          style={{
            ...buttonStyle,
            background: downloadStatus.csv === 'success' ? '#f0fdf4' : 'white',
            borderColor: downloadStatus.csv === 'success' ? '#86efac' : '#e2e8f0',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.target.style.background =
              downloadStatus.csv === 'success' ? '#f0fdf4' : 'white';
            e.target.style.borderColor =
              downloadStatus.csv === 'success' ? '#86efac' : '#e2e8f0';
          }}
        >
          {getStatusIcon(downloadStatus.csv) || (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          {downloadStatus.csv === 'loading'
            ? 'Generating...'
            : downloadStatus.csv === 'success'
            ? 'Downloaded!'
            : 'Export CSV'}
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          disabled={copyStatus === 'loading'}
          style={{
            ...buttonStyle,
            background: copyStatus === 'success' ? '#f0fdf4' : 'white',
            borderColor: copyStatus === 'success' ? '#86efac' : '#e2e8f0',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = copyStatus === 'success' ? '#f0fdf4' : 'white';
            e.target.style.borderColor = copyStatus === 'success' ? '#86efac' : '#e2e8f0';
          }}
        >
          {getStatusIcon(copyStatus) || (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
          {copyStatus === 'loading'
            ? 'Copying...'
            : copyStatus === 'success'
            ? 'Copied!'
            : 'Copy Link'}
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#e2e8f0';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print
        </button>
      </div>

      {/* Info text */}
      <p
        style={{
          margin: '12px 0 0',
          fontSize: '0.75rem',
          color: '#94a3b8',
          textAlign: 'center',
        }}
      >
        Your data is processed locally and never stored on our servers.
      </p>
    </div>
  );
}
