import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, getImageUrl, capitalize } from '../helpers/utils';
import NotFound from '../components/NotFound';

function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPokemon() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPokemon(data);
      } catch (e) {
        console.error('Failed to fetch pokemon:', e);
        setNotFound(true);
      }
      setLoading(false);
    }

    fetchPokemon();
  }, [id]);

  if (notFound) return <NotFound />;
  if (loading || !pokemon) return <p>Loading...</p>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <img
          src={getImageUrl(pokemon.id)}
          alt={pokemon.name}
          className="detail-img"
        />
        <div className="detail-info">
          <h2>{capitalize(pokemon.name)}</h2>
          <span className="detail-id">#{pokemon.id}</span>
          <dl className="info-grid">
            <dt>Height</dt>
            <dd>{pokemon.height}</dd>
            <dt>Weight</dt>
            <dd>{pokemon.weight}</dd>
            <dt>Base Experience</dt>
            <dd>{pokemon.base_experience}</dd>
            <dt>Species</dt>
            <dd>{capitalize(pokemon.species.name)}</dd>
          </dl>
        </div>
      </div>

      <section className="detail-section">
        <h3>Types</h3>
        <div className="tag-list">
          {pokemon.types.map((t) => {
            const typeId = extractId(t.type.url);
            return (
              <Link to={`/types/${typeId}`} key={typeId} className="tag">
                {capitalize(t.type.name)}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="detail-section">
        <h3>Abilities</h3>
        <div className="tag-list">
          {pokemon.abilities.map((a) => {
            const abilityId = extractId(a.ability.url);
            return (
              <Link to={`/abilities/${abilityId}`} key={abilityId} className="tag">
                {capitalize(a.ability.name.replaceAll('-', ' '))}
                {a.is_hidden && <span className="hidden-label"> (Hidden)</span>}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="detail-section">
        <h3>Stats</h3>
        <div className="stats-list">
          {pokemon.stats.map((s) => (
            <div className="stat-row" key={s.stat.name}>
              <span className="stat-name">
                {capitalize(s.stat.name.replaceAll('-', ' '))}
              </span>
              <div className="stat-bar-bg">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${Math.min((s.base_stat / 150) * 100, 100)}%` }}
                />
              </div>
              <span className="stat-value">{s.base_stat}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>Moves</h3>
        <ul className="moves-list">
          {pokemon.moves.map((m) => (
            <li key={m.move.name}>{capitalize(m.move.name.replaceAll('-', ' '))}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PokemonDetail;
