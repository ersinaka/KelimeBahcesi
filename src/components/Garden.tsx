import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { DEFAULT_WORD_COUNT } from '../data/words';
import {
  countLearned,
  getGrowthStage,
  learnedInCategory,
  stageEmoji,
} from '../lib/progress';
import { speak } from '../lib/speech';
import { selectActiveProfile, useAppStore } from '../store/useAppStore';
import { BigButton } from './BigButton';
import { SoundToggle } from './SoundToggle';

export function Garden() {
  const navigate = useNavigate();
  const profile = useAppStore(selectActiveProfile);
  const words = useAppStore((s) => s.words);
  const wordStats = useAppStore((s) => s.wordStats);
  const settings = useAppStore((s) => s.settings);
  const badges = useAppStore((s) => (profile ? s.badges[profile.id] ?? [] : []));

  if (!profile) {
    return (
      <div className="screen">
        <p>Önce bir profil seç.</p>
        <BigButton onClick={() => navigate('/')}>Profil seç</BigButton>
      </div>
    );
  }

  const learned = countLearned(wordStats, profile.id);
  const total = words.filter((w) => !w.hidden).length || DEFAULT_WORD_COUNT;

  const onPlantClick = (text: string) => {
    speak(text, { volume: settings.volume, enabled: settings.soundEnabled });
  };

  return (
    <div className="screen garden-screen">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/menu')}
          aria-label="Ana menüye dön"
        >
          ←
        </button>
        <h1 className="topbar__title">Bahçem</h1>
        <SoundToggle />
      </header>

      <p className="garden-progress" aria-live="polite">
        {learned} / {total} kelime
      </p>

      {badges.length > 0 ? (
        <p className="garden-badges ink-soft" aria-label="Rozetler">
          🏅 {badges.length} rozet
        </p>
      ) : null}

      <div className="garden-scroll" role="region" aria-label="Bahçe bölgeleri">
        {CATEGORIES.map((cat) => {
          const prog = learnedInCategory(words, wordStats, profile.id, cat.id);
          const pct = prog.total === 0 ? 0 : Math.round((prog.learned / prog.total) * 100);
          const zoneWords = words.filter((w) => w.category === cat.id && !w.hidden);

          return (
            <section
              key={cat.id}
              className={`garden-zone garden-zone--${cat.id}`}
              style={{ backgroundColor: cat.colors.ground }}
              aria-label={`${cat.gardenZone}: ${prog.learned} / ${prog.total}`}
            >
              <div className="garden-zone__head">
                <span aria-hidden="true">{cat.emoji}</span>
                <h2>{cat.gardenZone}</h2>
                <div
                  className="progress-ring"
                  style={{
                    background: `conic-gradient(${cat.colors.accent} ${pct}%, rgba(255,255,255,0.5) 0)`,
                  }}
                  aria-hidden="true"
                >
                  <span>{pct}%</span>
                </div>
              </div>

              <div className="garden-plants">
                {zoneWords.map((w) => {
                  const st = wordStats.find(
                    (s) => s.profileId === profile.id && s.wordId === w.id,
                  );
                  const stage = getGrowthStage(st);
                  const display = stage === 3 ? w.emoji : stageEmoji(stage);
                  const label =
                    stage === 0
                      ? `${w.text} — boş toprak`
                      : stage === 1
                        ? `${w.text} — tohum`
                        : stage === 2
                          ? `${w.text} — filiz`
                          : `${w.text} — öğrenildi`;

                  return (
                    <motion.button
                      key={w.id}
                      type="button"
                      className={`garden-plant stage-${stage}`}
                      aria-label={label}
                      onClick={() => {
                        if (stage === 0) return;
                        onPlantClick(w.text);
                      }}
                      whileTap={settings.simpleMode || stage === 0 ? undefined : { scale: 1.2, y: -6 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <span aria-hidden="true">{display}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
