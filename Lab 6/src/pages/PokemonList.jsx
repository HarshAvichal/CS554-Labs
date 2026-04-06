import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, getImageUrl, capitalize } from '../helpers/utils';
import Pagination from '../components/Pagination';
import NotFound from '../components/NotFound';

const LIMIT = 10;

function PokemonList() {
  const { page } = useParams();
  const [pokemon, setPokemon] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [allPokemon, setAllPokemon] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentPage = parseInt(page);

  useEffect(() => {
    if (isNaN(currentPage) || currentPage < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchPokemon() {
      setLoading(true);
      setNotFound(false);
      try {
        const offset = (currentPage - 1) * LIMIT;
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${LIMIT}`
        );
        const data = await res.json();
        const pages = Math.ceil(data.count / LIMIT);

        if (currentPage > pages) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPokemon(data.results);
        setTotalPages(pages);
      } catch (e) {
        console.error('Failed to fetch pokemon:', e);
      }
      setLoading(false);
    }

    setSearch('');
    setAllPokemon(null);
    fetchPokemon();
  }, [currentPage]);

  async function handleSearch(term) {
    setSearch(term);
    if (term.trim().length === 0) {
      setAllPokemon(null);
      return;
    }
    if (!allPokemon) {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=1500`
        );
        const data = await res.json();
        setAllPokemon(data.results);
      } catch (e) {
        console.error('Failed to fetch all pokemon:', e);
      }
      setSearchLoading(false);
    }
  }

  if (notFound) return <NotFound />;
  if (loading) return <p>Loading...</p>;

  const isSearching = search.trim().length > 0;
  const searchResults = isSearching && allPokemon
    ? allPokemon.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="list-page">
      <h2>Pokemon</h2>
      <input
        type="text"
        placeholder="Search all Pokemon by name..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      {searchLoading && <p>Loading search results...</p>}
      {isSearching ? (
        <div className="card-grid">
          {searchResults.length > 0 ? (
            searchResults.slice(0, 20).map((p) => {
              const id = extractId(p.url);
              return (
                <Link to={`/pokemon/${id}`} key={id} className="card">
                  <img
                    src={getImageUrl(id)}
                    alt={p.name}
                    className="card-img"
                  />
                  <div className="card-body">
                    <span className="card-id">#{id}</span>
                    <span className="card-name">{capitalize(p.name)}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            !searchLoading && <p className="no-results">No Pokemon match your search.</p>
          )}
        </div>
      ) : (
        <>
          <div className="card-grid">
            {pokemon.map((p) => {
              const id = extractId(p.url);
              return (
                <Link to={`/pokemon/${id}`} key={id} className="card">
                  <img
                    src={getImageUrl(id)}
                    alt={p.name}
                    className="card-img"
                  />
                  <div className="card-body">
                    <span className="card-id">#{id}</span>
                    <span className="card-name">{capitalize(p.name)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/pokemon/page"
          />
        </>
      )}
    </div>
  );
}

export default PokemonList;
