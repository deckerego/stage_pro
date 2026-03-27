import { useParams, useLocation, Link } from 'react-router-dom';
import { useStageStream } from './useStageStream';

function formatClock(unixSeconds) {
  if (unixSeconds == null) return '—';
  const d = new Date(unixSeconds * 1000);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

function slideLines(text) {
  // Normalize \r\n and \r to \n before rendering
  return text.replace(/\r\n?/g, '\n');
}

export default function ScreenPage() {
  const { uuid } = useParams();
  const { state } = useLocation();

  // Screen and layout are passed as router state from ScreenCard.
  // If navigated directly (e.g. bookmark), these will be undefined.
  const screen = state?.screen ?? { uuid, name: 'Screen', index: '—' };
  const layout = state?.layout ?? null;

  const { slide, timers, videoCountdown, systemTime, connected } = useStageStream();

  const current = slide?.current;
  const next = slide?.next;
  const primaryTimer = timers[0] ?? null;

  return (
    <div className="screen-page">

      <header className="screen-page-header">
        <Link to="/" className="back-btn">← Back</Link>
        <div className="screen-page-title">
          <span className="screen-page-name">{screen.name}</span>
          {layout && <span className="screen-page-layout">{layout.name}</span>}
        </div>
        <div className="detail-live-indicator">
          <span className={`live-dot ${connected ? 'live' : ''}`} />
          {connected ? 'Live' : 'Waiting…'}
        </div>
      </header>

      <div className="stage-view">

        <div className="stage-current">
          {current?.text
            ? <div className="stage-current-text">{slideLines(current.text)}</div>
            : <div className="stage-idle-text">No active slide</div>
          }
        </div>

        <div className="stage-next">
          {next?.text
            ? <div className="stage-next-text">{slideLines(next.text)}</div>
            : <div className="stage-next-text stage-next-empty">—</div>
          }
        </div>

        <div className="stage-bottom">
          <div className="stage-cell">
            <div className="stage-cell-value">
              {primaryTimer ? primaryTimer.time : '—'}
            </div>
            <div className="stage-cell-label">
              {primaryTimer ? primaryTimer.id.name : 'Timer'}
            </div>
          </div>
          <div className="stage-cell">
            <div className="stage-cell-value">{formatClock(systemTime)}</div>
            <div className="stage-cell-label">Clock</div>
          </div>
          <div className="stage-cell">
            <div className="stage-cell-value">{videoCountdown ?? '—'}</div>
            <div className="stage-cell-label">Video Countdown</div>
          </div>
        </div>

      </div>
    </div>
  );
}
