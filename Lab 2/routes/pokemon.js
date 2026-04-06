import express from 'express';
import axios from 'axios';
import redisClient from '../config/redis.js';
import { createCacheMiddleware, validateHistoryIds } from '../middleware/cache.js';
import { normalizePokemon, constructWrapper } from '../helpers/normalize.js';

const router = express.Router();

router.get('/history', async (req, res) => {
  try {
    const historyEntries = await redisClient.lRange('recentlyViewed', 0, 19);

    if (historyEntries.length === 0) {
      return res.json([]);
    }

    const validEntries = validateHistoryIds(historyEntries);
    const historyResponse = [];

    for (const entry of validEntries) {
      const [idStr, timestampStr] = entry.split(':');
      const id = parseInt(idStr, 10);
      const timestamp = parseInt(timestampStr, 10);

      const redisKey = `pokemon:${id}`;
      const cachedData = await redisClient.get(redisKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const endpoint = `https://pokeapi.co/api/v2/pokemon/${id}`;

        const pokemonWrapper = constructWrapper(
          'pokeapi',
          endpoint,
          { hit: true, key: redisKey },
          parsedData
        );

        historyResponse.push({
          viewedAt: new Date(timestamp).toISOString(),
          id: id,
          pokemon: pokemonWrapper
        });
      }
    }

    res.json(historyResponse);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', createCacheMiddleware('pokemon'), async (req, res) => {
  const { id } = req.params;
  const { redisKey } = req.cacheInfo;

  try {
    const endpoint = `https://pokeapi.co/api/v2/pokemon/${id}`;

    const response = await axios.get(endpoint);
    const pokemonData = response.data;

    const normalizedData = normalizePokemon(pokemonData);

    const timestamp = Date.now();
    const historyEntry = `${id}:${timestamp}`;

    const multi = redisClient.multi();

    multi.set(redisKey, JSON.stringify(normalizedData));
    multi.lPush('recentlyViewed', historyEntry);

    await multi.exec();

    const wrapper = constructWrapper(
      'pokeapi',
      endpoint,
      { hit: false, key: redisKey },
      normalizedData
    );

    res.json(wrapper);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Not found' });
    }
    console.error('Error fetching Pokemon:', error.message);
    res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
});

export default router;
