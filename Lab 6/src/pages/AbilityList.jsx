import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, capitalize } from '../helpers/utils';
import Pagination from '../components/Pagination';
import NotFound from '../components/NotFound';

const LIMIT = 5;

function AbilityList() {
  const { page } = useParams();
  const [abilities, setAbilities] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [allAbilities, setAllAbilities] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentPage = parseInt(page);

  useEffect(() => {
    if (isNaN(currentPage) || currentPage < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchAbilities() {
      setLoading(true);
      setNotFound(false);
      try {
        const offset = (currentPage - 1) * LIMIT;
        const res = await fetch(
          `https://pokeapi.co/api/v2/ability?offset=${offset}&limit=${LIMIT}`
        );
        const data = await res.json();
        const pages = Math.ceil(data.count / LIMIT);

        if (currentPage > pages) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setAbilities(data.results);
        setTotalPages(pages);
      } catch (e) {
        console.error('Failed to fetch abilities:', e);
      }
      setLoading(false);
    }

    setSearch('');
    setAllAbilities(null);
    fetchAbilities();
  }, [currentPage]);

  async function handleSearch(term) {
    setSearch(term);
    if (term.trim().length === 0) {
      setAllAbilities(null);
      return;
    }
    if (!allAbilities) {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/ability?limit=500`
        );
        const data = await res.json();
        setAllAbilities(data.results);
      } catch (e) {
        console.error('Failed to fetch all abilities:', e);
      }
      setSearchLoading(false);
    }
  }

  if (notFound) return <NotFound />;
  if (loading) return <p>Loading...</p>;

  const isSearching = search.trim().length > 0;
  const searchResults = isSearching && allAbilities
    ? allAbilities.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="list-page">
      <h2>Abilities</h2>
      <input
        type="text"
        placeholder="Search all abilities by name..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      {searchLoading && <p>Loading search results...</p>}
      {isSearching ? (
        <ul className="simple-list">
          {searchResults.length > 0 ? (
            searchResults.slice(0, 20).map((a) => {
              const id = extractId(a.url);
              return (
                <li key={id}>
                  <Link to={`/abilities/${id}`}>
                    {capitalize(a.name.replaceAll('-', ' '))}
                  </Link>
                </li>
              );
            })
          ) : (
            !searchLoading && <p className="no-results">No abilities match your search.</p>
          )}
        </ul>
      ) : (
        <>
          <ul className="simple-list">
            {abilities.map((a) => {
              const id = extractId(a.url);
              return (
                <li key={id}>
                  <Link to={`/abilities/${id}`}>
                    {capitalize(a.name.replaceAll('-', ' '))}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/abilities/page"
          />
        </>
      )}
    </div>
  );
}

export default AbilityList;
