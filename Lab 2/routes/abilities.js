import express from 'express';
import axios from 'axios';
import redisClient from '../config/redis.js';
import { createCacheMiddleware } from '../middleware/cache.js';
import { normalizeAbility, constructWrapper } from '../helpers/normalize.js';

const router = express.Router();

router.get('/:id', createCacheMiddleware('ability'), async (req, res) => {
  const { id } = req.params;
  const { redisKey } = req.cacheInfo;

  try {
    const endpoint = `https://pokeapi.co/api/v2/ability/${id}`;

    const response = await axios.get(endpoint);
    const abilityData = response.data;

    let normalizedData;
    try {
      normalizedData = normalizeAbility(abilityData);
    } catch (normError) {
      return res.status(500).json({ error: 'Missing English effect data' });
    }

    await redisClient.set(redisKey, JSON.stringify(normalizedData));

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
    console.error('Error fetching Ability:', error.message);
    res.status(500).json({ error: 'Failed to fetch Ability data' });
  }
});

export default router;
