import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { EditorPage } from './pages/EditorPage';
import { SettingsPage } from './pages/SettingsPage';

// ThemeProviderの子として機能する新しいコンポーネント
function AppContent() {
  const { colors } = useThemeContext(); // ここでcolorsを取得

  return (
    <Router>
      <div className={`min-h-screen ${colors.bg}`}> {/* colors.bgを追加 */}
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/*" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent /> {/* AppContentをThemeProviderの子としてレンダリング */}
    </ThemeProvider>
  );
}

export default App;