import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActivityChrome } from '../components/ActivityChrome';
import { BigButton } from '../components/BigButton';
import { SoftPetals } from '../components/SoftPetals';
import { WordCard } from '../components/WordCard';
import { pickDistractors, shuffle } from '../lib/activity';
import { prefetchSpeech } from '../lib/speech';
import { useActivitySession } from '../hooks/useActivitySession';
import type { Word } from '../data/words';

export function Match() {
  const navigate = useNavigate();
  const session = useActivitySession('match');
  const { current, profile, words, hardMode, feedback, locked, hint, speakWord, markCorrect, markGentle, settings } =
    session;

  const [dimmed, setDimmed] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const choices: Word[] = useMemo(() => {
    if (!current) return [];
    const distractors = pickDistractors(current, words, 2, hardMode);
    return shuffle([current, ...distractors]);
  }, [current, hardMode, words]);

  useEffect(() => {
    setDimmed([]);
    setShakeId(null);
    if (current) {
      prefetchSpeech([current.text], { enabled: settings.soundEnabled });
      const t = window.setTimeout(() => speakWord(current.text), 250);
      return () => window.clearTimeout(t);
    }
  }, [current, speakWord, settings.soundEnabled]);

  if (!profile) {
    return (
      <div className="screen">
        <p>Önce bir profil seç.</p>
        <BigButton onClick={() => navigate('/')}>Profil seç</BigButton>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="screen">
        <ActivityChrome title="Eşleştir" index={0} total={0} />
        <div className="placeholder-panel">
          <p>Bu seçim için henüz yeterli kelime yok.</p>
          <BigButton onClick={() => navigate('/play')}>Geri dön</BigButton>
        </div>
      </div>
    );
  }

  const onPick = (word: Word) => {
    if (locked || dimmed.includes(word.id)) return;
    if (word.id === current.id) {
      markCorrect(current);
    } else {
      setShakeId(word.id);
      setDimmed((d) => [...d, word.id]);
      markGentle();
      window.setTimeout(() => setShakeId(null), 500);
    }
  };

  return (
    <div className="screen activity-screen">
      <ActivityChrome title="Eşleştir" index={session.index} total={session.total} hint={hint} />

      <div className="match-prompt">
        <button
          type="button"
          className="speak-btn"
          onClick={() => speakWord(current.text)}
          aria-label="Kelimeyi tekrar dinle"
        >
          <span aria-hidden="true">🔊</span>
          <span>Dinle</span>
        </button>
        <p className="match-prompt__text ink-soft">Doğru resmi seç</p>
      </div>

      <div className="match-choices" role="group" aria-label="Seçenekler">
        {choices.map((w) => {
          const isTarget = w.id === current.id;
          const cardState =
            feedback === 'correct' && isTarget
              ? 'correct'
              : feedback === 'gentle' && shakeId === w.id
                ? 'gentle'
                : 'idle';
          const card = (
            <WordCard
              emoji={w.emoji}
              aria-label={`Seçenek ${w.emoji}`}
              dimmed={dimmed.includes(w.id)}
              state={cardState}
              disabled={locked || dimmed.includes(w.id)}
              onClick={() => onPick(w)}
            />
          );

          return (
            <motion.div
              key={w.id}
              className="match-choices__item"
              animate={
                settings.simpleMode
                  ? {}
                  : shakeId === w.id
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : feedback === 'correct' && isTarget
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1, x: 0 }
              }
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {card}
              {feedback === 'correct' && isTarget && !settings.simpleMode ? (
                <SoftPetals active />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
