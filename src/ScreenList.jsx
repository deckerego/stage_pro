import { useProPresenter } from './useProPresenter';
import ScreenCard from './ScreenCard';

function StatusDot({ enabled, loading, error }) {
  if (loading) return <span className="status-dot" />;
  if (error) return <span className="status-dot error" />;
  return <span className={`status-dot ${enabled ? 'active' : ''}`} />;
}

function statusLabel(enabled, loading, error) {
  if (loading) return 'Connecting…';
  if (error) return 'Disconnected';
  return enabled ? 'Stage screens on' : 'Stage screens off';
}

export default function ScreenList() {
  const { screens, screenLayouts, stageEnabled, loading, error, reload } = useProPresenter();

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ProPresenter Monitor</h1>
          <div className="subtitle">Stage screen confidence monitor</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-indicator">
            <StatusDot enabled={stageEnabled} loading={loading} error={error} />
            {statusLabel(stageEnabled, loading, error)}
          </div>
          <button className="refresh-btn" onClick={reload} disabled={loading}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </header>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Fetching stage screens…</span>
        </div>
      )}

      {!loading && error && (
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <h3>Unable to connect</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && screens.length === 0 && (
        <div className="empty-state">No stage screens configured in ProPresenter.</div>
      )}

      {!loading && !error && screens.length > 0 && (
        <>
          <div className="section-title">Stage Screens — {screens.length} configured</div>
          <div className="screen-grid">
            {screens.map((screen) => (
              <ScreenCard
                key={screen.uuid}
                screen={screen}
                layout={screenLayouts[screen.uuid]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
