import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SoundToggle } from '../components/SoundToggle';
import { countLearned } from '../lib/progress';
import { selectActiveProfile, useAppStore } from '../store/useAppStore';

export function MainMenu() {
  const navigate = useNavigate();
  const profile = useAppStore(selectActiveProfile);
  const words = useAppStore((s) => s.words);
  const wordStats = useAppStore((s) => s.wordStats);
  const setTherapistUnlocked = useAppStore((s) => s.setTherapistUnlocked);
  const verifyPin = useAppStore((s) => s.verifyPin);
  const simpleMode = useAppStore((s) => s.settings.simpleMode);

  useEffect(() => {
    if (!profile) navigate('/');
  }, [profile, navigate]);

  if (!profile) return null;

  const learned = countLearned(wordStats, profile.id);
  const total = words.filter((w) => !w.hidden).length;

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

  const tiles = [
    {
      id: 'play',
      title: 'Oyna',
      sub: 'Kelime topla, bahçeyi büyüt',
      emoji: '🎮',
      className: 'menu-tile--play',
      onClick: () => navigate('/play'),
    },
    {
      id: 'garden',
      title: 'Bahçem',
      sub: `${learned} / ${total} kelime açıldı`,
      emoji: '🌻',
      className: 'menu-tile--garden',
      onClick: () => navigate('/garden'),
    },
  ] as const;

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

      <div className="menu-hero-art" aria-hidden="true">
        <motion.span
          className="menu-hero-art__item"
          animate={simpleMode ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🦋
        </motion.span>
        <motion.span
          className="menu-hero-art__item menu-hero-art__item--b"
          animate={simpleMode ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 2.6, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌼
        </motion.span>
        <motion.span
          className="menu-hero-art__item menu-hero-art__item--c"
          animate={simpleMode ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 3.8, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐦
        </motion.span>
      </div>

      <div className="menu-tiles">
        {tiles.map((tile, i) => (
          <motion.button
            key={tile.id}
            type="button"
            className={`menu-tile ${tile.className}`}
            onClick={tile.onClick}
            aria-label={tile.title}
            initial={simpleMode ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            whileTap={simpleMode ? undefined : { scale: 0.97, y: 3 }}
          >
            <span className="menu-tile__emoji" aria-hidden="true">
              {tile.emoji}
            </span>
            <span className="menu-tile__text">
              <span className="menu-tile__title">{tile.title}</span>
              <span className="menu-tile__sub">{tile.sub}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <div className="menu-actions__row">
        <button
          type="button"
          className="menu-mini"
          onClick={() => navigate('/settings')}
          aria-label="Ayarlar"
        >
          ⚙️ Ayarlar
        </button>
        <button type="button" className="menu-mini" onClick={openTherapist} aria-label="Terapist paneli">
          🔒 Terapist
        </button>
      </div>
    </div>
  );
}
