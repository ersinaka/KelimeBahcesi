import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type NativeBtn = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface WordCardProps extends NativeBtn {
  emoji: string;
  label?: string;
  selected?: boolean;
  dimmed?: boolean;
  state?: 'idle' | 'correct' | 'gentle';
  index?: number;
  simple?: boolean;
}

/** Büyük dokunmatik oyun kartı — basınca çöker, doğru/yanlış halleri. */
export function WordCard({
  emoji,
  label,
  selected = false,
  dimmed = false,
  state = 'idle',
  index = 0,
  simple = false,
  className = '',
  disabled,
  ...rest
}: WordCardProps) {
  return (
    <motion.div
      className="word-card-motion"
      initial={simple ? false : { opacity: 0, y: 24, scale: 0.92 }}
      animate={dimmed ? { opacity: 0.35, y: 0, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: 'easeOut', delay: simple ? 0 : index * 0.07 }}
      whileTap={disabled || simple || dimmed ? undefined : { scale: 0.94, y: 4 }}
    >
      <button
        type="button"
        className={[
          'word-card',
          selected ? 'is-selected' : '',
          dimmed ? 'is-dimmed' : '',
          state !== 'idle' ? `is-${state}` : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        {...rest}
      >
        <span className="word-card__plate" aria-hidden="true" />
        <span className="word-card__emoji" aria-hidden="true">
          {emoji}
        </span>
        {label ? <span className="word-card__label">{label}</span> : null}
        {state === 'correct' ? (
          <span className="word-card__badge" aria-hidden="true">
            ✓
          </span>
        ) : null}
        {state === 'gentle' ? (
          <span className="word-card__badge word-card__badge--gentle" aria-hidden="true">
            ↻
          </span>
        ) : null}
      </button>
    </motion.div>
  );
}
