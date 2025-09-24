import { Routes, Route } from 'react-router-dom';
import SpotifyLogin from './components/SpotifyLogin';
import AuthSuccess from './components/AuthSuccess';
import Dashboard from './components/Dashboard';

// Placeholder components
const LoginPage = () => <div className="p-4"><h1 className="text-2xl">Login</h1></div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<SpotifyLogin />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;