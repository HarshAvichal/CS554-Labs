export const normalizePokemon = (pokemonData) => {
  const baseStats = {};

  pokemonData.stats.forEach(stat => {
    baseStats[stat.stat.name] = stat.base_stat;
  });

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    height: pokemonData.height,
    weight: pokemonData.weight,
    types: pokemonData.types
      .map(t => t.type.name)
      .sort(),
    abilities: pokemonData.abilities
      .map(a => a.ability.name)
      .sort(),
    baseStats: baseStats
  };
};

export const normalizeAbility = (abilityData) => {
  const englishEffect = abilityData.effect_entries.find(
    entry => entry.language.name === 'en'
  );

  if (!englishEffect) {
    throw new Error('Missing English effect data');
  }

  return {
    id: abilityData.id,
    name: abilityData.name,
    generation: abilityData.generation.name,
    effect: englishEffect.effect,
    shortEffect: englishEffect.short_effect
  };
};

export const normalizeMove = (moveData) => {
  return {
    id: moveData.id,
    name: moveData.name,
    type: moveData.type.name,
    damageClass: moveData.damage_class.name,
    power: moveData.power ?? 0,
    pp: moveData.pp,
    accuracy: moveData.accuracy ?? 0,
    meta: {
      critRate: moveData.meta?.crit_rate ?? 0,
      drain: moveData.meta?.drain ?? 0,
      healing: moveData.meta?.healing ?? 0,
      flinchChance: moveData.meta?.flinch_chance ?? 0
    }
  };
};

export const constructWrapper = (source, endpoint, cacheInfo, data) => {
  return {
    source,
    endpoint,
    cache: cacheInfo,
    fetchedAt: new Date().toISOString(),
    data
  };
};
