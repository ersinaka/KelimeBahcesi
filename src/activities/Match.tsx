import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActivityChrome } from '../components/ActivityChrome';
import { BigButton } from '../components/BigButton';
import { GrowthPop } from '../components/GrowthPop';
import { ListenButton } from '../components/ListenButton';
import { PlayScene } from '../components/PlayScene';
import { SoftPetals } from '../components/SoftPetals';
import { WordCard } from '../components/WordCard';
import { pickDistractors, shuffle } from '../lib/activity';
import { prefetchSpeech } from '../lib/speech';
import { useActivitySession } from '../hooks/useActivitySession';
import type { Word } from '../data/words';

export function Match() {
  const navigate = useNavigate();
  const session = useActivitySession('match');
  const {
    current,
    profile,
    words,
    hardMode,
    feedback,
    locked,
    hint,
    speakWord,
    markCorrect,
    markGentle,
    settings,
  } = session;

  const [dimmed, setDimmed] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [showGrowth, setShowGrowth] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const choices: Word[] = useMemo(() => {
    if (!current) return [];
    const distractors = pickDistractors(current, words, 2, hardMode);
    return shuffle([current, ...distractors]);
  }, [current, hardMode, words]);

  useEffect(() => {
    setDimmed([]);
    setShakeId(null);
    setShowGrowth(false);
    setRoundKey((k) => k + 1);
    if (current) {
      prefetchSpeech([current.text], { enabled: settings.soundEnabled });
      const t = window.setTimeout(() => {
        setSpeaking(true);
        speakWord(current.text);
        window.setTimeout(() => setSpeaking(false), 1400);
      }, 350);
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
      setShowGrowth(true);
      markCorrect(current);
    } else {
      setShakeId(word.id);
      setDimmed((d) => [...d, word.id]);
      markGentle();
      window.setTimeout(() => setShakeId(null), 500);
    }
  };

  const replay = () => {
    setSpeaking(true);
    speakWord(current.text);
    window.setTimeout(() => setSpeaking(false), 1400);
  };

  return (
    <div className="screen activity-screen activity-screen--immersive">
      <ActivityChrome
        title="Eşleştir"
        index={session.index}
        total={session.total}
        hint={hint || (speaking ? 'Dinle…' : 'Doğru resmi bul!')}
        simple={settings.simpleMode}
      />

      <PlayScene categoryId={current.category}>
        <div className="match-board">
          <div className="match-board__listen">
            <ListenButton
              onClick={replay}
              speaking={speaking || feedback === 'correct'}
              label={speaking ? 'Konuşuyor' : 'Tekrar dinle'}
              simple={settings.simpleMode}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={roundKey}
              className="match-choices"
              role="group"
              aria-label="Seçenekler"
              initial={settings.simpleMode ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {choices.map((w, i) => {
                const isTarget = w.id === current.id;
                const cardState =
                  feedback === 'correct' && isTarget
                    ? 'correct'
                    : feedback === 'gentle' && shakeId === w.id
                      ? 'gentle'
                      : 'idle';

                return (
                  <motion.div
                    key={w.id}
                    className="match-choices__item"
                    animate={
                      settings.simpleMode
                        ? {}
                        : shakeId === w.id
                          ? { x: [0, -10, 10, -6, 6, 0] }
                          : feedback === 'correct' && isTarget
                            ? { scale: [1, 1.1, 1], y: [0, -8, 0] }
                            : feedback === 'correct' && !isTarget
                              ? { opacity: 0.25, scale: 0.92 }
                              : {}
                    }
                    transition={{ duration: 0.38, ease: 'easeOut' }}
                  >
                    <WordCard
                      emoji={w.emoji}
                      aria-label={`Seçenek ${w.emoji}`}
                      dimmed={dimmed.includes(w.id)}
                      state={cardState}
                      index={i}
                      simple={settings.simpleMode}
                      disabled={locked || dimmed.includes(w.id)}
                      onClick={() => onPick(w)}
                    />
                    {feedback === 'correct' && isTarget && !settings.simpleMode ? (
                      <SoftPetals active />
                    ) : null}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <GrowthPop
            active={showGrowth && feedback === 'correct'}
            emoji={current.emoji}
            simple={settings.simpleMode}
          />
        </div>
      </PlayScene>
    </div>
  );
}
