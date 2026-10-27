import type { CSSProperties, ReactNode } from 'react';
import type { CategoryId } from '../data/categories';
import { CATEGORY_BY_ID } from '../data/categories';

interface PlaySceneProps {
  categoryId?: CategoryId | null;
  children: ReactNode;
  className?: string;
}

/** Etkinlik için pastel sahne: gökyüzü, tepecikler, zemin. */
export function PlayScene({ categoryId, children, className = '' }: PlaySceneProps) {
  const cat = categoryId ? CATEGORY_BY_ID[categoryId] : null;
  const ground = cat?.colors.ground ?? '#CFEFD9';
  const accent = cat?.colors.accent ?? '#6CC08B';

  return (
    <div
      className={`play-scene ${className}`.trim()}
      style={
        {
          '--scene-ground': ground,
          '--scene-accent': accent,
        } as CSSProperties
      }
    >
      <div className="play-scene__sky" aria-hidden="true">
        <span className="play-scene__cloud play-scene__cloud--a" />
        <span className="play-scene__cloud play-scene__cloud--b" />
        <span className="play-scene__sun" />
      </div>
      <svg className="play-scene__hills" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 80 Q120 20 240 70 T480 55 T800 75 L800 120 L0 120 Z"
          fill="color-mix(in srgb, var(--scene-ground) 70%, #fff)"
        />
        <path
          d="M0 95 Q160 40 320 85 T640 70 T800 90 L800 120 L0 120 Z"
          fill="var(--scene-ground)"
        />
      </svg>
      <div className="play-scene__stage">{children}</div>
      <div className="play-scene__grass" aria-hidden="true" />
    </div>
  );
}
