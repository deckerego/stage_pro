import { useEffect } from 'react';
import { layoutThumbnailUrl } from './api';
import { useSlideStream } from './useSlideStream';

export default function ScreenDetail({ screen, layout, onClose }) {
  const { slide, connected } = useSlideStream(true);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const current = slide?.current;
  const next = slide?.next;

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        <div className="detail-header">
          <div className="detail-header-left">
            <div className="detail-screen-name">{screen.name}</div>
            {layout && <div className="detail-layout-name">{layout.name}</div>}
          </div>
          <div className="detail-header-right">
            <div className="detail-live-indicator">
              <span className={`live-dot ${connected ? 'live' : ''}`} />
              {connected ? 'Live' : 'Waiting…'}
            </div>
            <button className="detail-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {layout && (
          <div className="detail-thumbnail-strip">
            <img
              src={layoutThumbnailUrl(layout.uuid)}
              alt={`${layout.name} layout`}
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="detail-content">
          <div className="detail-slide-section current-slide">
            <div className="detail-slide-label">Current</div>
            {current?.text ? (
              <div className="detail-slide-text current-text">
                {current.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            ) : (
              <div className="detail-slide-empty">No active slide</div>
            )}
          </div>

          <div className="detail-divider" />

          <div className="detail-slide-section next-slide">
            <div className="detail-slide-label">Next</div>
            {next?.text ? (
              <div className="detail-slide-text next-text">
                {next.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            ) : (
              <div className="detail-slide-empty">—</div>
            )}
          </div>

          {current?.notes && (
            <>
              <div className="detail-divider" />
              <div className="detail-notes-section">
                <div className="detail-slide-label">Notes</div>
                <div className="detail-notes-text">{current.notes}</div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
