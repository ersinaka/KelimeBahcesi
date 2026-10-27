import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActivityChrome } from '../components/ActivityChrome';
import { BigButton } from '../components/BigButton';
import { GrowthPop } from '../components/GrowthPop';
import { PlayScene } from '../components/PlayScene';
import { SoftPetals } from '../components/SoftPetals';
import {
  fuzzyMatchWord,
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from '../lib/speech';
import { useActivitySession } from '../hooks/useActivitySession';

export function Say() {
  const navigate = useNavigate();
  const session = useActivitySession('say');
  const {
    current,
    profile,
    feedback,
    locked,
    hint,
    setHint,
    markCorrect,
    markGentle,
    settings,
    speakWord,
  } = session;

  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [autoFailed, setAutoFailed] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [showGrowth, setShowGrowth] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const autoSupported = isSpeechRecognitionSupported();

  const cleanupRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
  }, [playbackUrl]);

  useEffect(() => {
    setHeard('');
    setAutoFailed(false);
    setListening(false);
    setShowGrowth(false);
    recognitionRef.current?.abort();
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
    if (current) {
      const t = window.setTimeout(() => speakWord('Bu ne? Söyle!'), 200);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => () => cleanupRecording(), [cleanupRecording]);

  const startRecordingOptional = async () => {
    if (!settings.playbackOwnVoice) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (playbackUrl) URL.revokeObjectURL(playbackUrl);
        setPlaybackUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
    } catch {
      // Mikrofon yoksa sessizce devam
    }
  };

  const stopRecordingOptional = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const succeed = () => {
    if (!current) return;
    setShowGrowth(true);
    markCorrect(current);
  };

  const startListen = async () => {
    if (locked || listening) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setHint('Mikrofon tanınamadı — terapist butonlarını kullan.');
      setAutoFailed(true);
      return;
    }

    await startRecordingOptional();
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = 'tr-TR';
    rec.continuous = false;
    rec.interimResults = false;
    setListening(true);
    setHeard('');
    setHint('Dinliyorum…');

    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setHeard(transcript);
      stopRecordingOptional();
      setListening(false);
      if (current && fuzzyMatchWord(transcript, current.text)) {
        succeed();
      } else {
        setAutoFailed(true);
        markGentle();
      }
    };

    rec.onerror = () => {
      stopRecordingOptional();
      setListening(false);
      setAutoFailed(true);
      setHint('Bir daha deneyelim!');
    };

    rec.onend = () => {
      setListening(false);
      stopRecordingOptional();
    };

    try {
      rec.start();
    } catch {
      setListening(false);
      setAutoFailed(true);
      setHint('Bir daha deneyelim!');
    }
  };

  const stopListen = () => {
    recognitionRef.current?.stop();
    setListening(false);
    stopRecordingOptional();
  };

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
        <ActivityChrome title="Söyle" index={0} total={0} />
        <div className="placeholder-panel">
          <p>Bu seçim için henüz yeterli kelime yok.</p>
          <BigButton onClick={() => navigate('/play')}>Geri dön</BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="screen activity-screen activity-screen--immersive">
      <ActivityChrome
        title="Söyle"
        index={session.index}
        total={session.total}
        hint={hint || 'Bu ne? Söyle!'}
        simple={settings.simpleMode}
      />

      <PlayScene categoryId={current.category}>
        <div className="say-stage">
          <motion.div
            key={current.id}
            className={`say-emoji ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'gentle' ? 'is-gentle' : ''} ${listening ? 'is-listening' : ''}`}
            initial={settings.simpleMode ? false : { scale: 0.85, opacity: 0 }}
            animate={
              feedback === 'correct' && !settings.simpleMode
                ? { scale: [1, 1.1, 1], opacity: 1 }
                : feedback === 'gentle' && !settings.simpleMode
                  ? { x: [0, -6, 6, 0], scale: 1, opacity: 1 }
                  : listening && !settings.simpleMode
                    ? { scale: [1, 1.04, 1], opacity: 1 }
                    : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <span aria-hidden="true">{current.emoji}</span>
            {feedback === 'correct' && !settings.simpleMode ? <SoftPetals active /> : null}
          </motion.div>
          <p className="say-prompt">Bu ne? Söyle!</p>
          {heard ? (
            <p className="say-heard" aria-live="polite">
              Duyulan: <strong>{heard}</strong>
            </p>
          ) : null}
        </div>

        <div className="say-controls">
          {autoSupported ? (
            <button
              type="button"
              className={`mic-orb ${listening ? 'is-on' : ''}`}
              onClick={listening ? stopListen : startListen}
              disabled={locked}
              aria-label={listening ? 'Dinlemeyi durdur' : 'Mikrofonla söyle'}
            >
              <span aria-hidden="true">{listening ? '⏹️' : '🎤'}</span>
              <span>{listening ? 'Durdur' : 'Söyle'}</span>
            </button>
          ) : null}

          <div className="say-therapist" role="group" aria-label="Terapist onayı">
            <BigButton
              icon="✓"
              variant="primary"
              disabled={locked}
              onClick={succeed}
              aria-label="Doğru"
            >
              Doğru
            </BigButton>
            <BigButton
              icon="↻"
              variant="surface"
              disabled={locked}
              onClick={() => {
                setAutoFailed(true);
                markGentle();
              }}
              aria-label="Tekrar dene"
            >
              Tekrar dene
            </BigButton>
          </div>
          <p className="ink-soft" style={{ textAlign: 'center', fontSize: '0.95rem' }}>
            {!autoSupported
              ? 'Konuşma tanıma yok — terapist onayını kullan.'
              : autoFailed
                ? 'Bir daha deneyelim — istersen terapist butonunu kullan.'
                : 'Mikrofon veya terapist onayı ile devam et.'}
          </p>

          {playbackUrl && settings.playbackOwnVoice ? (
            <audio controls src={playbackUrl} aria-label="Kendi sesini dinle" />
          ) : null}
        </div>

        <GrowthPop
          active={showGrowth && feedback === 'correct'}
          emoji={current.emoji}
          simple={settings.simpleMode}
        />
      </PlayScene>
    </div>
  );
}
