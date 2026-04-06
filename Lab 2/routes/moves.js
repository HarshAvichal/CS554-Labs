import express from 'express';
import axios from 'axios';
import redisClient from '../config/redis.js';
import { createCacheMiddleware } from '../middleware/cache.js';
import { normalizeMove, constructWrapper } from '../helpers/normalize.js';

const router = express.Router();

router.get('/:id', createCacheMiddleware('move'), async (req, res) => {
  const { id } = req.params;
  const { redisKey } = req.cacheInfo;

  try {
    const endpoint = `https://pokeapi.co/api/v2/move/${id}`;

    const response = await axios.get(endpoint);
    const moveData = response.data;

    const normalizedData = normalizeMove(moveData);

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
    console.error('Error fetching Move:', error.message);
    res.status(500).json({ error: 'Failed to fetch Move data' });
  }
});

export default router;
