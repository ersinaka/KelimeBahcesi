import type { ButtonHTMLAttributes } from 'react';

interface WordCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  label?: string;
  selected?: boolean;
  dimmed?: boolean;
  state?: 'idle' | 'correct' | 'gentle';
}

/** Büyük emoji kartı — etkinliklerde kullanılır (iskelet + temel stiller). */
export function WordCard({
  emoji,
  label,
  selected = false,
  dimmed = false,
  state = 'idle',
  className = '',
  ...rest
}: WordCardProps) {
  return (
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
      {...rest}
    >
      <span className="word-card__emoji" aria-hidden="true">
        {emoji}
      </span>
      {label ? <span className="word-card__label">{label}</span> : null}
    </button>
  );
}
