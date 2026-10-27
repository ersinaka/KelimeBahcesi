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
    opacity: isDragging ? 0.85 : wilted ? 0.55 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`word-card categorize-card ${selected ? 'is-selected' : ''} ${wilted ? 'is-wilted' : ''}`}
      style={style}
      onClick={onSelect}
      aria-label="Kelime kartı — sürükle veya dokunarak seç"
      {...listeners}
      {...attributes}
      aria-pressed={selected}
    >
      <span className="word-card__emoji" aria-hidden="true">
        {emoji}
      </span>
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
    if (!cardSelected) {
      // Dokun-seç: önce kart seçilmemişse yine de kabul et (motor kolaylığı)
    }
    if (cat === current.category) {
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
    <div className="screen activity-screen">
      <ActivityChrome title="Kategorile" index={session.index} total={session.total} hint={hint} />

      <p className="match-prompt__text" style={{ textAlign: 'center' }}>
        Kartı doğru sepete koy
      </p>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="categorize-stage">
          <div className="categorize-stage__card">
            <motion.div
              animate={
                wilted && !settings.simpleMode
                  ? { opacity: [1, 0.45, 1], filter: ['saturate(1)', 'saturate(0.4)', 'saturate(1)'] }
                  : { opacity: 1 }
              }
              transition={{ duration: 2, ease: 'easeOut' }}
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

          <div className="categorize-baskets" role="group" aria-label="Sepetler">
            {baskets.map((id) => {
              const cat = CATEGORY_BY_ID[id];
              return (
                <DropBasket
                  key={id}
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

      <p className="ink-soft" style={{ textAlign: 'center', fontSize: '0.95rem' }}>
        Sürükleyebilir veya önce karta, sonra sepete dokunabilirsin.
      </p>
    </div>
  );
}
