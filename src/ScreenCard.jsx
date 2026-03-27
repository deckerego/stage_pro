import { layoutThumbnailUrl } from './api';

export default function ScreenCard({ screen, layout }) {
  return (
    <div className="screen-card">
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
    </div>
  );
}
