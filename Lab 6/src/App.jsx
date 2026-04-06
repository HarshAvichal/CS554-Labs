import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PokemonList from './pages/PokemonList';
import PokemonDetail from './pages/PokemonDetail';
import AbilityList from './pages/AbilityList';
import AbilityDetail from './pages/AbilityDetail';
import TypeList from './pages/TypeList';
import TypeDetail from './pages/TypeDetail';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="main-nav">
        <Link to="/" className="nav-brand">PokeAPI Explorer</Link>
        <div className="nav-links">
          <Link to="/pokemon/page/1">Pokemon</Link>
          <Link to="/abilities/page/1">Abilities</Link>
          <Link to="/types/page/1">Types</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/page/:page" element={<PokemonList />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/abilities/page/:page" element={<AbilityList />} />
          <Route path="/abilities/:id" element={<AbilityDetail />} />
          <Route path="/types/page/:page" element={<TypeList />} />
          <Route path="/types/:id" element={<TypeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
