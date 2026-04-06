import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, capitalize } from '../helpers/utils';
import Pagination from '../components/Pagination';
import NotFound from '../components/NotFound';

const LIMIT = 5;

function TypeList() {
  const { page } = useParams();
  const [types, setTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [allTypes, setAllTypes] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentPage = parseInt(page);

  useEffect(() => {
    if (isNaN(currentPage) || currentPage < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchTypes() {
      setLoading(true);
      setNotFound(false);
      try {
        const offset = (currentPage - 1) * LIMIT;
        const res = await fetch(
          `https://pokeapi.co/api/v2/type?offset=${offset}&limit=${LIMIT}`
        );
        const data = await res.json();
        const pages = Math.ceil(data.count / LIMIT);

        if (currentPage > pages) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setTypes(data.results);
        setTotalPages(pages);
      } catch (e) {
        console.error('Failed to fetch types:', e);
      }
      setLoading(false);
    }

    setSearch('');
    setAllTypes(null);
    fetchTypes();
  }, [currentPage]);

  async function handleSearch(term) {
    setSearch(term);
    if (term.trim().length === 0) {
      setAllTypes(null);
      return;
    }
    if (!allTypes) {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/type?limit=50`
        );
        const data = await res.json();
        setAllTypes(data.results);
      } catch (e) {
        console.error('Failed to fetch all types:', e);
      }
      setSearchLoading(false);
    }
  }

  if (notFound) return <NotFound />;
  if (loading) return <p>Loading...</p>;

  const isSearching = search.trim().length > 0;
  const searchResults = isSearching && allTypes
    ? allTypes.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="list-page">
      <h2>Types</h2>
      <input
        type="text"
        placeholder="Search all types by name..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      {searchLoading && <p>Loading search results...</p>}
      {isSearching ? (
        <ul className="simple-list">
          {searchResults.length > 0 ? (
            searchResults.map((t) => {
              const id = extractId(t.url);
              return (
                <li key={id}>
                  <Link to={`/types/${id}`}>{capitalize(t.name)}</Link>
                </li>
              );
            })
          ) : (
            !searchLoading && <p className="no-results">No types match your search.</p>
          )}
        </ul>
      ) : (
        <>
          <ul className="simple-list">
            {types.map((t) => {
              const id = extractId(t.url);
              return (
                <li key={id}>
                  <Link to={`/types/${id}`}>{capitalize(t.name)}</Link>
                </li>
              );
            })}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/types/page"
          />
        </>
      )}
    </div>
  );
}

export default TypeList;
