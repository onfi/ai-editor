import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { EditorPage } from './pages/EditorPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/*" element={<EditorPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;