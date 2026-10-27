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
        <p className="session-end__emoji" aria-hidden="true">
          🎉
        </p>
        <p className="session-end__score">
          {state.correct} doğru · {state.attempts} deneme
        </p>
      </div>

      {grown.length > 0 ? (
        <section className="session-end__grown" aria-label="Yeni bahçe öğeleri">
          <h2>Bahçende açılanlar</h2>
          <ul className="grown-list">
            {grown.map((w) => (
              <li key={w!.id} className="grown-list__item">
                <span aria-hidden="true">{w!.emoji}</span>
                <span>{w!.text}</span>
              </li>
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
