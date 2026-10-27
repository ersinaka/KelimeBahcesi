import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseCategoryParam } from '../lib/activity';
import { getGrowthStage, pickWeightedWords } from '../lib/progress';
import {
  selectActiveProfile,
  useAppStore,
  type ActivityType,
} from '../store/useAppStore';
import type { Word } from '../data/words';
import { playSoftTone, speak } from '../lib/speech';

export type FeedbackKind = 'idle' | 'correct' | 'gentle';

export function useActivitySession(activity: ActivityType) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const profile = useAppStore(selectActiveProfile);
  const words = useAppStore((s) => s.words);
  const settings = useAppStore((s) => s.settings);
  const recordAttempt = useAppStore((s) => s.recordAttempt);
  const addSession = useAppStore((s) => s.addSession);
  const awardProgressRewards = useAppStore((s) => s.awardProgressRewards);

  const categories = parseCategoryParam(params.get('category'));
  const startedAt = useRef(new Date().toISOString());
  const sessionCorrect = useRef(0);
  const sessionAttempts = useRef(0);
  const newlyLearnedRef = useRef<string[]>([]);

  const questions = useMemo(() => {
    if (!profile) return [] as Word[];
    const { wordStats } = useAppStore.getState();
    return pickWeightedWords(words, wordStats, profile.id, settings.questionsPerSession, {
      categories,
      maxLevel: profile.maxLevel,
    });
    // Yalnızca seans başında üret
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, activity, params.get('category'), settings.questionsPerSession]);

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>('idle');
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState('');

  const current = questions[index] ?? null;
  const total = questions.length;

  const speakWord = useCallback(
    (text: string) => {
      speak(text, {
        volume: settings.volume,
        enabled: settings.soundEnabled,
      });
    },
    [settings.soundEnabled, settings.volume],
  );

  const finish = useCallback(() => {
    if (!profile) return;
    const durationSec = Math.max(
      1,
      Math.round((Date.now() - new Date(startedAt.current).getTime()) / 1000),
    );
    addSession({
      profileId: profile.id,
      activity,
      startedAt: startedAt.current,
      durationSec,
      correct: sessionCorrect.current,
      attempts: sessionAttempts.current,
      note: '',
    });
    const newBadges = awardProgressRewards(profile.id);
    navigate('/session-end', {
      state: {
        activity,
        correct: sessionCorrect.current,
        attempts: sessionAttempts.current,
        newlyLearned: newlyLearnedRef.current,
        newBadges,
        replayPath: `/play/${activity}?category=${params.get('category') ?? 'all'}`,
      },
      replace: true,
    });
  }, [activity, addSession, awardProgressRewards, navigate, params, profile]);

  const markCorrect = useCallback(
    (word: Word) => {
      if (!profile || locked) return;
      setLocked(true);
      setFeedback('correct');
      setHint('Harika!');
      if (settings.soundEnabled) playSoftTone('success', settings.volume);

      const before = getGrowthStage(
        useAppStore
          .getState()
          .wordStats.find((s) => s.profileId === profile.id && s.wordId === word.id),
      );
      recordAttempt(profile.id, word.id, true);
      sessionCorrect.current += 1;
      sessionAttempts.current += 1;

      if (before < 3 && before + 1 >= 3) {
        newlyLearnedRef.current = [...newlyLearnedRef.current, word.id];
      }

      speakWord(word.text);

      window.setTimeout(() => {
        setFeedback('idle');
        setHint('');
        setLocked(false);
        if (index + 1 >= total) finish();
        else setIndex((i) => i + 1);
      }, settings.simpleMode ? 500 : 1100);
    },
    [
      finish,
      index,
      locked,
      profile,
      recordAttempt,
      settings.simpleMode,
      settings.soundEnabled,
      settings.volume,
      speakWord,
      total,
    ],
  );

  const markGentle = useCallback(() => {
    if (locked) return;
    setFeedback('gentle');
    setHint('Bir daha deneyelim!');
    sessionAttempts.current += 1;
    if (profile && current) {
      recordAttempt(profile.id, current.id, false);
    }
    if (settings.soundEnabled) playSoftTone('gentle', settings.volume);
    window.setTimeout(() => {
      setFeedback('idle');
    }, settings.simpleMode ? 400 : 900);
  }, [current, locked, profile, recordAttempt, settings.simpleMode, settings.soundEnabled, settings.volume]);

  return {
    profile,
    settings,
    questions,
    current,
    index,
    total,
    feedback,
    locked,
    hint,
    setHint,
    speakWord,
    markCorrect,
    markGentle,
    finish,
    hardMode: settings.hardMode,
    words,
    categories,
  };
}
