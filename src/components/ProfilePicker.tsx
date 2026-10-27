import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, type CategoryId } from '../data/categories';
import { AVATAR_OPTIONS, useAppStore } from '../store/useAppStore';
import { BigButton } from './BigButton';

export function ProfilePicker() {
  const navigate = useNavigate();
  const profiles = useAppStore((s) => s.profiles);
  const addProfile = useAppStore((s) => s.addProfile);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const verifyPin = useAppStore((s) => s.verifyPin);
  const setTherapistUnlocked = useAppStore((s) => s.setTherapistUnlocked);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const selectProfile = (id: string) => {
    setActiveProfile(id);
    setTherapistUnlocked(false);
    navigate('/menu');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const allCats = CATEGORIES.map((c) => c.id) as CategoryId[];
    const id = addProfile({
      name: trimmed,
      avatar,
      targetCategories: allCats,
      maxLevel: 3,
    });
    setName('');
    setAvatar(AVATAR_OPTIONS[0]);
    setCreating(false);
    selectProfile(id);
  };

  const handleTherapist = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pin)) {
      setPinError(false);
      setPin('');
      setPinOpen(false);
      setTherapistUnlocked(true);
      navigate('/therapist');
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="screen welcome">
      <header className="welcome__hero">
        <p className="welcome__brand" aria-label="Kelime Bahçesi">
          🌱 Kelime Bahçesi
        </p>
        <h1 className="welcome__title">Kim oynayacak?</h1>
        <p className="welcome__sub">Profilini seç veya yeni bir tane oluştur.</p>
      </header>

      {!creating ? (
        <>
          <ul className="profile-grid" aria-label="Profiller">
            {profiles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="profile-card"
                  onClick={() => selectProfile(p.id)}
                  aria-label={`${p.name} profilini seç`}
                >
                  <span className="profile-card__avatar" aria-hidden="true">
                    {p.avatar}
                  </span>
                  <span className="profile-card__name">{p.name}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="profile-card profile-card--new"
                onClick={() => setCreating(true)}
                aria-label="Yeni profil oluştur"
              >
                <span className="profile-card__avatar" aria-hidden="true">
                  ➕
                </span>
                <span className="profile-card__name">Yeni profil</span>
              </button>
            </li>
          </ul>
        </>
      ) : (
        <form className="create-profile" onSubmit={handleCreate}>
          <label className="field">
            <span className="field__label">Ad</span>
            <input
              className="field__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              required
              aria-label="Çocuğun adı"
            />
          </label>

          <fieldset className="avatar-picker">
            <legend className="field__label">Avatar</legend>
            <div className="avatar-picker__row" role="radiogroup" aria-label="Avatar seç">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={avatar === a}
                  className={`avatar-chip ${avatar === a ? 'is-selected' : ''}`}
                  onClick={() => setAvatar(a)}
                  aria-label={`Avatar ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="create-profile__actions">
            <BigButton type="submit" icon="✨">
              Başla
            </BigButton>
            <BigButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setCreating(false)}
            >
              Vazgeç
            </BigButton>
          </div>
        </form>
      )}

      <footer className="welcome__footer">
        {!pinOpen ? (
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setPinOpen(true);
              setPinError(false);
            }}
            aria-label="Terapist girişi"
          >
            🔒 Terapist
          </button>
        ) : (
          <form className="pin-form" onSubmit={handleTherapist}>
            <label className="field field--inline">
              <span className="field__label">PIN</span>
              <input
                className="field__input field__input--pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                aria-label="Terapist PIN kodu"
                aria-invalid={pinError}
              />
            </label>
            {pinError ? (
              <p className="form-hint form-hint--warn" role="alert">
                PIN yanlış. Bir daha deneyelim!
              </p>
            ) : null}
            <div className="pin-form__actions">
              <BigButton type="submit" size="md" variant="accent">
                Giriş
              </BigButton>
              <BigButton
                type="button"
                size="md"
                variant="ghost"
                onClick={() => {
                  setPinOpen(false);
                  setPin('');
                  setPinError(false);
                }}
              >
                Kapat
              </BigButton>
            </div>
          </form>
        )}
      </footer>
    </div>
  );
}
