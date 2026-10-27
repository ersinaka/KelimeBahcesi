import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from './BigButton';

/** Terapist paneli iskeleti — adım 5'te doldurulacak. */
export function TherapistPanel() {
  const navigate = useNavigate();
  const unlocked = useAppStore((s) => s.therapistUnlocked);
  const setTherapistUnlocked = useAppStore((s) => s.setTherapistUnlocked);
  const profiles = useAppStore((s) => s.profiles);
  const words = useAppStore((s) => s.words);

  if (!unlocked) {
    return (
      <div className="screen">
        <p>Terapist paneli için PIN gerekli.</p>
        <BigButton onClick={() => navigate('/')}>Karşılama ekranına dön</BigButton>
      </div>
    );
  }

  return (
    <div className="screen therapist-screen">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            setTherapistUnlocked(false);
            navigate('/');
          }}
          aria-label="Çıkış"
        >
          ←
        </button>
        <h1 className="topbar__title">Terapist</h1>
        <span className="topbar__spacer" />
      </header>

      <nav className="therapist-tabs" aria-label="Terapist sekmeleri">
        <button type="button" className="tab is-active" disabled>
          Profiller
        </button>
        <button type="button" className="tab" disabled>
          Kelimeler
        </button>
        <button type="button" className="tab" disabled>
          İstatistik
        </button>
        <button type="button" className="tab" disabled>
          Ayarlar
        </button>
      </nav>

      <section className="therapist-panel">
        <h2>Özet</h2>
        <p>
          {profiles.length} profil · {words.filter((w) => !w.hidden).length} görünür kelime
        </p>
        <p className="ink-soft">
          Tam paneller (kelime editörü, istatistik, ayarlar) sonraki adımda eklenecek.
        </p>
        <ul className="therapist-profile-list">
          {profiles.map((p) => (
            <li key={p.id}>
              <span aria-hidden="true">{p.avatar}</span> {p.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
