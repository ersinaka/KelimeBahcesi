import { useNavigate } from 'react-router-dom';
import { SoundToggle } from './SoundToggle';

interface ActivityChromeProps {
  title: string;
  index: number;
  total: number;
  hint?: string;
}

export function ActivityChrome({ title, index, total, hint }: ActivityChromeProps) {
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/play')}
          aria-label="Geri"
        >
          ←
        </button>
        <div className="topbar__center">
          <h1 className="topbar__title">{title}</h1>
          <p className="activity-progress" aria-live="polite">
            {total > 0 ? `${index + 1} / ${total}` : '…'}
          </p>
        </div>
        <SoundToggle />
      </header>
      <div className="activity-hint" aria-live="polite" role="status">
        {hint || '\u00A0'}
      </div>
    </>
  );
}
