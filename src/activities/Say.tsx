import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActivityChrome } from '../components/ActivityChrome';
import { BigButton } from '../components/BigButton';
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
        markCorrect(current);
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
    <div className="screen activity-screen">
      <ActivityChrome title="Söyle" index={session.index} total={session.total} hint={hint} />

      <div className="say-stage">
        <motion.div
          className={`say-emoji ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'gentle' ? 'is-gentle' : ''}`}
          animate={
            feedback === 'correct' && !settings.simpleMode
              ? { scale: [1, 1.08, 1] }
              : feedback === 'gentle' && !settings.simpleMode
                ? { x: [0, -6, 6, 0] }
                : {}
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <span aria-hidden="true">{current.emoji}</span>
          {feedback === 'correct' && !settings.simpleMode ? <SoftPetals active /> : null}
        </motion.div>
        <p className="say-prompt">Bu ne? Söyle!</p>
        {heard ? (
          <p className="ink-soft" aria-live="polite">
            Duyulan: {heard}
          </p>
        ) : null}
      </div>

      <div className="say-controls">
        {autoSupported ? (
          <BigButton
            icon={listening ? '⏹️' : '🎤'}
            variant={listening ? 'accent' : 'primary'}
            onClick={listening ? stopListen : startListen}
            disabled={locked}
            aria-label={listening ? 'Dinlemeyi durdur' : 'Mikrofonla söyle'}
          >
            {listening ? 'Durdur' : 'Söyle'}
          </BigButton>
        ) : null}

        <div className="say-therapist" role="group" aria-label="Terapist onayı">
          <BigButton
            icon="✓"
            variant="primary"
            disabled={locked}
            onClick={() => markCorrect(current)}
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
    </div>
  );
}
