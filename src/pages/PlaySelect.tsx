import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, type CategoryId } from '../data/categories';
import { BigButton } from '../components/BigButton';
import { SoundToggle } from '../components/SoundToggle';
import type { ActivityType } from '../store/useAppStore';
import { selectActiveProfile, useAppStore } from '../store/useAppStore';

const ACTIVITIES: Array<{ id: ActivityType; title: string; emoji: string; hint: string }> = [
  { id: 'match', title: 'Eşleştir', emoji: '👂', hint: 'Duy ve seç' },
  { id: 'categorize', title: 'Kategorile', emoji: '🧺', hint: 'Doğru sepete koy' },
  { id: 'say', title: 'Söyle', emoji: '🗣️', hint: 'Kelimeyi söyle' },
];

export function PlaySelect() {
  const navigate = useNavigate();
  const profile = useAppStore(selectActiveProfile);
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');

  useEffect(() => {
    if (!profile) navigate('/');
  }, [profile, navigate]);

  if (!profile) return null;

  const start = () => {
    if (!activity) return;
    const cat = category === 'all' ? 'all' : category;
    navigate(`/play/${activity}?category=${cat}`);
  };

  return (
    <div className="screen play-select">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/menu')}
          aria-label="Ana menüye dön"
        >
          ←
        </button>
        <h1 className="topbar__title">Ne oynayalım?</h1>
        <SoundToggle />
      </header>

      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="section-title">
          Etkinlik
        </h2>
        <ul className="choice-grid">
          {ACTIVITIES.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={`choice-card ${activity === a.id ? 'is-selected' : ''}`}
                onClick={() => setActivity(a.id)}
                aria-pressed={activity === a.id}
                aria-label={`${a.title}: ${a.hint}`}
              >
                <span className="choice-card__emoji" aria-hidden="true">
                  {a.emoji}
                </span>
                <span className="choice-card__title">{a.title}</span>
                <span className="choice-card__hint">{a.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="section-title">
          Kategori
        </h2>
        <ul className="category-grid">
          <li>
            <button
              type="button"
              className={`category-card ${category === 'all' ? 'is-selected' : ''}`}
              style={{ backgroundColor: '#E8F5EE' }}
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
            >
              <span aria-hidden="true">🌈</span>
              <span>Hepsi</span>
            </button>
          </li>
          {CATEGORIES.filter((c) => profile.targetCategories.includes(c.id)).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`category-card ${category === c.id ? 'is-selected' : ''}`}
                style={{ backgroundColor: c.colors.ground }}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                aria-label={c.name}
              >
                <span aria-hidden="true">{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="bottom-actions">
        <BigButton
          icon="▶️"
          disabled={!activity}
          onClick={start}
          aria-label="Etkinliği başlat"
        >
          Başla
        </BigButton>
      </div>
    </div>
  );
}
