import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { playSoftTone } from '../lib/speech';
import { useAppStore } from '../store/useAppStore';

type Variant = 'primary' | 'accent' | 'ghost' | 'surface';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  icon?: string;
  size?: 'lg' | 'md';
}

export function BigButton({
  children,
  variant = 'primary',
  icon,
  size = 'lg',
  className = '',
  onClick,
  type = 'button',
  ...rest
}: BigButtonProps) {
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled);
  const volume = useAppStore((s) => s.settings.volume);

  return (
    <button
      type={type}
      className={`big-btn big-btn--${variant} big-btn--${size} ${className}`.trim()}
      onClick={(e) => {
        if (soundEnabled) playSoftTone('click', volume);
        onClick?.(e);
      }}
      {...rest}
    >
      {icon ? (
        <span className="big-btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="big-btn__label">{children}</span>
    </button>
  );
}
