import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Match } from './activities/Match';
import { Categorize } from './activities/Categorize';
import { Say } from './activities/Say';
import { Garden } from './components/Garden';
import { ProfilePicker } from './components/ProfilePicker';
import { TherapistPanel } from './components/TherapistPanel';
import { MainMenu } from './pages/MainMenu';
import { PlaySelect } from './pages/PlaySelect';
import { SessionEnd } from './pages/SessionEnd';
import { SettingsPage } from './pages/SettingsPage';
import { useAppStore } from './store/useAppStore';

function AppShell() {
  const simpleMode = useAppStore((s) => s.settings.simpleMode);

  return (
    <div className={`app-root ${simpleMode ? 'is-simple' : ''}`}>
      <Routes>
        <Route path="/" element={<ProfilePicker />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/play" element={<PlaySelect />} />
        <Route path="/play/match" element={<Match />} />
        <Route path="/play/categorize" element={<Categorize />} />
        <Route path="/play/say" element={<Say />} />
        <Route path="/session-end" element={<SessionEnd />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/therapist" element={<TherapistPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
