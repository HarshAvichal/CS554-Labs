import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, capitalize } from '../helpers/utils';
import NotFound from '../components/NotFound';

function DamageList({ label, types }) {
  return (
    <div className="damage-row">
      <span className="damage-label">{label}</span>
      <div className="tag-list">
        {types && types.length > 0 ? (
          types.map((t) => {
            const typeId = extractId(t.url);
            return (
              <Link to={`/types/${typeId}`} key={typeId} className="tag">
                {capitalize(t.name)}
              </Link>
            );
          })
        ) : (
          <span className="none-label">None</span>
        )}
      </div>
    </div>
  );
}

function TypeDetail() {
  const { id } = useParams();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchType() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${id}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setType(data);
      } catch (e) {
        console.error('Failed to fetch type:', e);
        setNotFound(true);
      }
      setLoading(false);
    }

    fetchType();
  }, [id]);

  if (notFound) return <NotFound />;
  if (loading || !type) return <p>Loading...</p>;

  const dr = type.damage_relations;

  return (
    <div className="detail-page">
      <div className="detail-section">
        <h2>{capitalize(type.name)}</h2>
        <p className="detail-id">Type #{type.id}</p>
      </div>

      <section className="detail-section">
        <h3>Damage Relations</h3>
        <div className="damage-grid">
          <DamageList label="Double Damage To" types={dr.double_damage_to} />
          <DamageList label="Double Damage From" types={dr.double_damage_from} />
          <DamageList label="Half Damage To" types={dr.half_damage_to} />
          <DamageList label="Half Damage From" types={dr.half_damage_from} />
          <DamageList label="No Damage To" types={dr.no_damage_to} />
          <DamageList label="No Damage From" types={dr.no_damage_from} />
        </div>
      </section>

      <section className="detail-section">
        <h3>Pokemon with this Type</h3>
        <ul className="pokemon-link-list">
          {type.pokemon.map((p) => {
            const pokemonId = extractId(p.pokemon.url);
            return (
              <li key={pokemonId}>
                <Link to={`/pokemon/${pokemonId}`}>
                  {capitalize(p.pokemon.name)}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {type.moves.length > 0 && (
        <section className="detail-section">
          <h3>Moves</h3>
          <ul className="moves-list">
            {type.moves.map((m) => (
              <li key={m.name}>{capitalize(m.name.replaceAll('-', ' '))}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default TypeDetail;
