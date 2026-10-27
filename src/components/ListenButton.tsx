import { motion } from 'framer-motion';

interface ListenButtonProps {
  onClick: () => void;
  speaking?: boolean;
  label?: string;
  simple?: boolean;
}

/** Büyük dinle orb’u — ses dalgaları ile. */
export function ListenButton({
  onClick,
  speaking = false,
  label = 'Dinle',
  simple = false,
}: ListenButtonProps) {
  return (
    <button
      type="button"
      className={`listen-orb ${speaking ? 'is-speaking' : ''}`}
      onClick={onClick}
      aria-label="Kelimeyi dinle"
    >
      {!simple && (
        <span className="listen-orb__waves" aria-hidden="true">
          <motion.span
            className="listen-orb__wave"
            animate={speaking ? { scale: [1, 1.35], opacity: [0.55, 0] } : { scale: 1, opacity: 0.25 }}
            transition={{ duration: 1.1, repeat: speaking ? Infinity : 0, ease: 'easeOut' }}
          />
          <motion.span
            className="listen-orb__wave listen-orb__wave--delay"
            animate={speaking ? { scale: [1, 1.55], opacity: [0.4, 0] } : { scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.1, delay: 0.25, repeat: speaking ? Infinity : 0, ease: 'easeOut' }}
          />
        </span>
      )}
      <span className="listen-orb__core" aria-hidden="true">
        🔊
      </span>
      <span className="listen-orb__label">{label}</span>
    </button>
  );
}
