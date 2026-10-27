import { useNavigate } from 'react-router-dom';
import { SeedPath } from './SeedPath';
import { SoundToggle } from './SoundToggle';

interface ActivityChromeProps {
  title: string;
  index: number;
  total: number;
  hint?: string;
  simple?: boolean;
}

export function ActivityChrome({
  title,
  index,
  total,
  hint,
  simple = false,
}: ActivityChromeProps) {
  const navigate = useNavigate();

  return (
    <div className="activity-chrome">
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
        </div>
        <SoundToggle />
      </header>
      <SeedPath index={index} total={total} simple={simple} />
      <div className="activity-hint" aria-live="polite" role="status">
        {hint || '\u00A0'}
      </div>
    </div>
  );
}
