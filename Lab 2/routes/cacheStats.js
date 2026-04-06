import express from 'express';
import redisClient from '../config/redis.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const routeMapping = [
      { redisKey: 'pokemon', responseKey: 'pokemon' },
      { redisKey: 'ability', responseKey: 'abilities' },
      { redisKey: 'move', responseKey: 'moves' }
    ];
    const stats = {};

    for (const { redisKey, responseKey } of routeMapping) {
      const hitsKey = `cache:stats:${redisKey}:hits`;
      const missesKey = `cache:stats:${redisKey}:misses`;

      const hits = await redisClient.get(hitsKey);
      const misses = await redisClient.get(missesKey);

      stats[responseKey] = {
        hits: hits ? parseInt(hits, 10) : 0,
        misses: misses ? parseInt(misses, 10) : 0
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch cache statistics' });
  }
});

export default router;
