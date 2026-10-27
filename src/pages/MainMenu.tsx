import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { SoundToggle } from '../components/SoundToggle';
import { selectActiveProfile, useAppStore } from '../store/useAppStore';

export function MainMenu() {
  const navigate = useNavigate();
  const profile = useAppStore(selectActiveProfile);
  const setTherapistUnlocked = useAppStore((s) => s.setTherapistUnlocked);
  const verifyPin = useAppStore((s) => s.verifyPin);

  useEffect(() => {
    if (!profile) navigate('/');
  }, [profile, navigate]);

  if (!profile) return null;

  const openTherapist = () => {
    const pin = window.prompt('Terapist PIN kodu:');
    if (pin == null) return;
    if (verifyPin(pin)) {
      setTherapistUnlocked(true);
      navigate('/therapist');
    } else {
      window.alert('PIN yanlış. Bir daha deneyelim!');
    }
  };

  return (
    <div className="screen menu-screen">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/')}
          aria-label="Profil değiştir"
        >
          {profile.avatar}
        </button>
        <div className="topbar__center">
          <p className="menu-brand">🌱 Kelime Bahçesi</p>
          <h1 className="topbar__title">Merhaba, {profile.name}!</h1>
        </div>
        <SoundToggle />
      </header>

      <div className="menu-actions">
        <BigButton icon="🎮" onClick={() => navigate('/play')} aria-label="Oyna">
          Oyna
        </BigButton>
        <BigButton
          icon="🌻"
          variant="accent"
          onClick={() => navigate('/garden')}
          aria-label="Bahçem"
        >
          Bahçem
        </BigButton>
        <div className="menu-actions__row">
          <BigButton
            icon="⚙️"
            variant="surface"
            size="md"
            onClick={() => navigate('/settings')}
            aria-label="Ayarlar"
          >
            Ayarlar
          </BigButton>
          <BigButton
            icon="🔒"
            variant="ghost"
            size="md"
            onClick={openTherapist}
            aria-label="Terapist paneli"
          >
            Terapist
          </BigButton>
        </div>
      </div>
    </div>
  );
}
