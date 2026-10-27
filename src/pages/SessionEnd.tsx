import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { SoundToggle } from '../components/SoundToggle';
import { BADGE_LABELS, useAppStore } from '../store/useAppStore';
import type { ActivityType } from '../store/useAppStore';

interface SessionEndState {
  activity: ActivityType;
  correct: number;
  attempts: number;
  newlyLearned: string[];
  newBadges: string[];
  replayPath: string;
}

export function SessionEnd() {
  const navigate = useNavigate();
  const location = useLocation();
  const words = useAppStore((s) => s.words);
  const simpleMode = useAppStore((s) => s.settings.simpleMode);
  const state = (location.state ?? null) as SessionEndState | null;

  if (!state) {
    return (
      <div className="screen">
        <p>Seans bulunamadı.</p>
        <BigButton onClick={() => navigate('/menu')}>Ana menü</BigButton>
      </div>
    );
  }

  const grown = state.newlyLearned
    .map((id) => words.find((w) => w.id === id))
    .filter(Boolean);

  return (
    <div className="screen session-end">
      <header className="topbar">
        <span className="topbar__spacer" />
        <h1 className="topbar__title">Bravo!</h1>
        <SoundToggle />
      </header>

      <div className="session-end__hero">
        <motion.p
          className="session-end__emoji"
          aria-hidden="true"
          animate={simpleMode ? {} : { y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        >
          🌟
        </motion.p>
        <p className="session-end__score">
          {state.correct} doğru · {state.attempts} deneme
        </p>
        <p className="session-end__cheer">Bahçen biraz daha büyüdü!</p>
      </div>

      {grown.length > 0 ? (
        <section className="session-end__grown" aria-label="Yeni bahçe öğeleri">
          <h2>Bahçende açılanlar</h2>
          <ul className="grown-list">
            {grown.map((w, i) => (
              <motion.li
                key={w!.id}
                className="grown-list__item"
                initial={simpleMode ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
              >
                <span aria-hidden="true">{w!.emoji}</span>
                <span>{w!.text}</span>
              </motion.li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="ink-soft" style={{ textAlign: 'center' }}>
          Bahçen büyümeye devam ediyor — bir sonraki seferde yeni filizler!
        </p>
      )}

      {state.newBadges.length > 0 ? (
        <ul className="badge-list" aria-label="Yeni rozetler">
          {state.newBadges.map((b) => (
            <li key={b} className="badge-chip">
              🏅 {BADGE_LABELS[b] ?? b}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="bottom-actions session-end__actions">
        <BigButton icon="🌻" variant="accent" onClick={() => navigate('/garden')}>
          Bahçeme git
        </BigButton>
        <BigButton icon="▶️" onClick={() => navigate(state.replayPath)}>
          Tekrar oyna
        </BigButton>
        <BigButton variant="ghost" size="md" onClick={() => navigate('/menu')}>
          Ana menü
        </BigButton>
      </div>
    </div>
  );
}
