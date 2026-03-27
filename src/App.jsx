import { Routes, Route } from 'react-router-dom';
import './App.css';
import ScreenList from './ScreenList';
import ScreenPage from './ScreenPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScreenList />} />
      <Route path="/screen/:uuid" element={<ScreenPage />} />
    </Routes>
  );
}
