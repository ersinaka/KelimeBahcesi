import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActivityChrome } from '../components/ActivityChrome';
import { Basket } from '../components/Basket';
import { BigButton } from '../components/BigButton';
import { GrowthPop } from '../components/GrowthPop';
import { PlayScene } from '../components/PlayScene';
import { SoftPetals } from '../components/SoftPetals';
import { CATEGORY_BY_ID, type CategoryId } from '../data/categories';
import { pickOpponentCategory } from '../lib/activity';
import { useActivitySession } from '../hooks/useActivitySession';

function DraggableCard({
  emoji,
  wilted,
  selected,
  onSelect,
}: {
  id: string;
  emoji: string;
  wilted: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'word-card',
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : wilted ? 0.55 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`word-card categorize-card ${selected ? 'is-selected' : ''} ${wilted ? 'is-wilted' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={style}
      onClick={onSelect}
      aria-label="Kelime kartı — sürükle veya dokunarak seç"
      {...listeners}
      {...attributes}
      aria-pressed={selected}
    >
      <span className="word-card__plate" aria-hidden="true" />
      <span className="word-card__emoji" aria-hidden="true">
        {emoji}
      </span>
      <span className="categorize-card__hint">👆 Sürükle</span>
    </button>
  );
}

function DropBasket({
  id,
  title,
  emoji,
  color,
  selected,
  onSelect,
}: {
  id: CategoryId;
  title: string;
  emoji: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`drop-wrap ${isOver ? 'is-over' : ''}`}>
      <Basket
        title={title}
        emoji={emoji}
        color={color}
        selected={selected || isOver}
        onSelect={onSelect}
        droppable
      />
    </div>
  );
}

export function Categorize() {
  const navigate = useNavigate();
  const session = useActivitySession('categorize');
  const {
    current,
    profile,
    categories,
    feedback,
    locked,
    hint,
    markCorrect,
    markGentle,
    settings,
  } = session;

  const [cardSelected, setCardSelected] = useState(false);
  const [wilted, setWilted] = useState(false);
  const [wrongBasket, setWrongBasket] = useState<CategoryId | null>(null);
  const [showGrowth, setShowGrowth] = useState(false);

  const baskets = useMemo(() => {
    if (!current) return [] as CategoryId[];
    const other = pickOpponentCategory(current.category, categories);
    return Math.random() > 0.5
      ? [current.category, other]
      : [other, current.category];
  }, [current, categories]);

  useEffect(() => {
    setCardSelected(false);
    setWilted(false);
    setWrongBasket(null);
    setShowGrowth(false);
  }, [current?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

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
        <ActivityChrome title="Kategorile" index={0} total={0} />
        <div className="placeholder-panel">
          <p>Bu seçim için henüz yeterli kelime yok.</p>
          <BigButton onClick={() => navigate('/play')}>Geri dön</BigButton>
        </div>
      </div>
    );
  }

  const tryBasket = (cat: CategoryId) => {
    if (locked) return;
    if (cat === current.category) {
      setShowGrowth(true);
      markCorrect(current);
    } else {
      setWrongBasket(cat);
      setWilted(true);
      markGentle();
      window.setTimeout(() => {
        setWilted(false);
        setWrongBasket(null);
      }, 2000);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const over = event.over?.id;
    if (!over || locked) return;
    tryBasket(String(over) as CategoryId);
  };

  return (
    <div className="screen activity-screen activity-screen--immersive">
      <ActivityChrome
        title="Kategorile"
        index={session.index}
        total={session.total}
        hint={hint || 'Kartı doğru sepete bırak'}
        simple={settings.simpleMode}
      />

      <PlayScene categoryId={current.category}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="categorize-stage">
            <div className="categorize-stage__card">
              <motion.div
                key={current.id}
                initial={settings.simpleMode ? false : { y: -20, opacity: 0 }}
                animate={
                  wilted && !settings.simpleMode
                    ? { opacity: [1, 0.45, 1], y: 0, filter: ['saturate(1)', 'saturate(0.4)', 'saturate(1)'] }
                    : { opacity: 1, y: 0 }
                }
                transition={{ duration: wilted ? 2 : 0.35, ease: 'easeOut' }}
              >
                <DraggableCard
                  id={current.id}
                  emoji={current.emoji}
                  wilted={wilted}
                  selected={cardSelected}
                  onSelect={() => setCardSelected(true)}
                />
              </motion.div>
              {feedback === 'correct' && !settings.simpleMode ? <SoftPetals active /> : null}
            </div>

            <div className="categorize-arrow" aria-hidden="true">
              ↓
            </div>

            <div className="categorize-baskets" role="group" aria-label="Sepetler">
              {baskets.map((id) => {
                const cat = CATEGORY_BY_ID[id];
                return (
                  <DropBasket
                    key={`${current.id}-${id}`}
                    id={id}
                    title={cat.name}
                    emoji={cat.emoji}
                    color={cat.colors.ground}
                    selected={wrongBasket === id}
                    onSelect={() => tryBasket(id)}
                  />
                );
              })}
            </div>
          </div>
        </DndContext>
        <GrowthPop
          active={showGrowth && feedback === 'correct'}
          emoji={current.emoji}
          simple={settings.simpleMode}
        />
      </PlayScene>
    </div>
  );
}
