import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';
import Artists from './pages/Artists.jsx';
import ArtistDetail from './pages/ArtistDetail.jsx';
import Albums from './pages/Albums.jsx';
import AlbumDetail from './pages/AlbumDetail.jsx';
import Listeners from './pages/Listeners.jsx';
import ListenerDetail from './pages/ListenerDetail.jsx';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:id" element={<AlbumDetail />} />
        <Route path="/listeners" element={<Listeners />} />
        <Route path="/listeners/:id" element={<ListenerDetail />} />
        <Route path="*" element={<Placeholder title="Not found" />} />
      </Route>
    </Routes>
  );
}
