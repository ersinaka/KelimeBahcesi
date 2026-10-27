import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { SoundToggle } from '../components/SoundToggle';
import { useAppStore } from '../store/useAppStore';

/** Çocuk / aile ayarları (basit). Tam ayarlar terapist panelinde. */
export function SettingsPage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <div className="screen settings-screen">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/menu')}
          aria-label="Ana menüye dön"
        >
          ←
        </button>
        <h1 className="topbar__title">Ayarlar</h1>
        <SoundToggle />
      </header>

      <div className="settings-list">
        <label className="settings-row">
          <span>Ses</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(e) =>
              updateSettings({ volume: Number(e.target.value) / 100 })
            }
            aria-label="Ses seviyesi"
          />
          <span aria-hidden="true">{Math.round(settings.volume * 100)}%</span>
        </label>

        <label className="settings-row">
          <span>Sade mod</span>
          <input
            type="checkbox"
            checked={settings.simpleMode}
            onChange={(e) => updateSettings({ simpleMode: e.target.checked })}
            aria-label="Sade mod: animasyonları azalt"
          />
        </label>

        <label className="settings-row">
          <span>Zor mod (çeldiriciler aynı kategoriden)</span>
          <input
            type="checkbox"
            checked={settings.hardMode}
            onChange={(e) => updateSettings({ hardMode: e.target.checked })}
            aria-label="Zor mod"
          />
        </label>

        <label className="settings-row">
          <span>Seans soru sayısı</span>
          <select
            value={settings.questionsPerSession}
            onChange={(e) =>
              updateSettings({
                questionsPerSession: Number(e.target.value) as 5 | 8 | 12,
              })
            }
            aria-label="Seans başına soru sayısı"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </label>

        <p className="ink-soft settings-note">
          PIN ve veri yedekleme terapist panelindedir.
        </p>
      </div>

      <div className="bottom-actions">
        <BigButton variant="surface" onClick={() => navigate('/menu')}>
          Tamam
        </BigButton>
      </div>
    </div>
  );
}
