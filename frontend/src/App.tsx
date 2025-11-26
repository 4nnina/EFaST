import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import NoPage from './pages/NoPage';
import PrefPage from './pages/PrefPage';
import CalcPage from './pages/CalcPage';
import ExplainPage from './pages/ExplainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<AdminPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/preferences/*" element={<PrefPage />} />
        <Route path="/calculate" element={<CalcPage />} />
        <Route path="/explain" element={<ExplainPage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </Router>
  );
}

export default App;

