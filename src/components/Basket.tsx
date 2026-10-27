import type { ReactNode } from 'react';

interface BasketProps {
  title: string;
  emoji: string;
  color?: string;
  children?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  droppable?: boolean;
}

/** Kategorile etkinliği için sepet iskeleti. */
export function Basket({
  title,
  emoji,
  color = '#E8F5E9',
  children,
  selected = false,
  onSelect,
  droppable = false,
}: BasketProps) {
  return (
    <button
      type="button"
      className={`basket ${selected ? 'is-selected' : ''} ${droppable ? 'is-droppable' : ''}`}
      style={{ backgroundColor: color }}
      onClick={onSelect}
      aria-label={`${title} sepeti`}
      aria-pressed={selected}
    >
      <span className="basket__emoji" aria-hidden="true">
        {emoji}
      </span>
      <span className="basket__title">{title}</span>
      {children}
    </button>
  );
}
