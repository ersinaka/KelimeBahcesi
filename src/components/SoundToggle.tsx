import { useAppStore } from '../store/useAppStore';

/** Üst barda her zaman görünen ses aç/kapa. */
export function SoundToggle() {
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
      title={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
    >
      <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
    </button>
  );
}
