import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>PokeAPI Explorer</h1>
      <p>
        Your one-stop Pokedex for exploring the world of Pokemon.
        Browse through hundreds of Pokemon, discover their abilities,
        and learn about different types.
      </p>
      <p>
        All data is pulled live from the{' '}
        <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
          PokeAPI
        </a>.
      </p>
      <nav className="home-nav">
        <Link to="/pokemon/page/1">Browse Pokemon</Link>
        <Link to="/abilities/page/1">Browse Abilities</Link>
        <Link to="/types/page/1">Browse Types</Link>
      </nav>
    </div>
  );
}

export default Home;
