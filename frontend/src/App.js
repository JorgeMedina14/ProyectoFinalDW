import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Recipes from './components/recipes/Recipes';
import RecipeGenerator from './components/recipes/RecipeGenerator';
import WeeklyMenuPlanner from './components/menu/WeeklyMenuPlanner';
import NotificationSettings from './components/notifications/NotificationSettings_new';
import NetworkDiagnostic from './components/common/NetworkDiagnostic';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe-generator" element={<RecipeGenerator />} />
          <Route path="/weekly-menu" element={<WeeklyMenuPlanner />} />
          <Route path="/notifications" element={<NotificationSettings />} />
          <Route path="/diagnostic" element={<NetworkDiagnostic />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
