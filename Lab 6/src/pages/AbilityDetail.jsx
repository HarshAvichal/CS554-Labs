import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { extractId, capitalize } from '../helpers/utils';
import NotFound from '../components/NotFound';

function AbilityDetail() {
  const { id } = useParams();
  const [ability, setAbility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchAbility() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${id}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setAbility(data);
      } catch (e) {
        console.error('Failed to fetch ability:', e);
        setNotFound(true);
      }
      setLoading(false);
    }

    fetchAbility();
  }, [id]);

  if (notFound) return <NotFound />;
  if (loading || !ability) return <p>Loading...</p>;

  const englishEffect = ability.effect_entries.find(
    (e) => e.language.name === 'en'
  );

  const englishFlavor = ability.flavor_text_entries.find(
    (e) => e.language.name === 'en'
  );

  return (
    <div className="detail-page">
      <div className="detail-section">
        <h2>{capitalize(ability.name.replaceAll('-', ' '))}</h2>
        <dl className="info-grid">
          <dt>ID</dt>
          <dd>{ability.id}</dd>
          <dt>Generation</dt>
          <dd>{capitalize(ability.generation.name.replaceAll('-', ' '))}</dd>
          <dt>Main Series</dt>
          <dd>{ability.is_main_series ? 'Yes' : 'No'}</dd>
        </dl>
      </div>

      {englishEffect && (
        <section className="detail-section">
          <h3>Effect</h3>
          <p>{englishEffect.effect}</p>
          {englishEffect.short_effect && (
            <p className="short-effect">{englishEffect.short_effect}</p>
          )}
        </section>
      )}

      {englishFlavor && (
        <section className="detail-section">
          <h3>Flavor Text</h3>
          <p>{englishFlavor.flavor_text}</p>
        </section>
      )}

      <section className="detail-section">
        <h3>Pokemon with this Ability</h3>
        <ul className="pokemon-link-list">
          {ability.pokemon.map((p) => {
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
    </div>
  );
}

export default AbilityDetail;
