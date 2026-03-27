import { useState } from 'react';
import { layoutThumbnailUrl } from './api';
import ScreenDetail from './ScreenDetail';

export default function ScreenCard({ screen, layout }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="screen-card" onClick={() => setOpen(true)} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}>
        <div className="screen-card-header">
          <div>
            <div className="screen-name">{screen.name}</div>
            <div className="screen-index">Screen {screen.index}</div>
          </div>
          <span className="badge">Stage</span>
        </div>

        {layout ? (
          <>
            <div className="layout-info">
              <div className="layout-label">Layout</div>
              <div className="layout-name">{layout.name}</div>
            </div>
            <div className="thumbnail-section">
              <img
                className="layout-thumbnail"
                src={layoutThumbnailUrl(layout.uuid)}
                alt={`Thumbnail for ${layout.name}`}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </>
        ) : (
          <div className="no-layout">No layout assigned</div>
        )}

        <div className="card-click-hint">Click to view live content</div>
      </div>

      {open && (
        <ScreenDetail
          screen={screen}
          layout={layout}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
