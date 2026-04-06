import redisClient from '../config/redis.js';
import { constructWrapper } from '../helpers/normalize.js';

const incrementCacheStat = async (route, statType) => {
  const key = `cache:stats:${route}:${statType}`;
  await redisClient.incr(key);
};

export const createCacheMiddleware = (resourceType) => {
  return async (req, res, next) => {
    const { id } = req.params;

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0 || numericId.toString() !== id) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const redisKey = `${resourceType}:${id}`;

    try {
      const cachedData = await redisClient.get(redisKey);

      if (cachedData) {
        await incrementCacheStat(resourceType, 'hits');

        const parsedData = JSON.parse(cachedData);

        if (resourceType === 'pokemon') {
          const timestamp = Date.now();
          const historyEntry = `${id}:${timestamp}`;
          await redisClient.lPush('recentlyViewed', historyEntry);
        }

        const endpoint = `https://pokeapi.co/api/v2/${resourceType}/${id}`;
        const wrapper = constructWrapper(
          'pokeapi',
          endpoint,
          { hit: true, key: redisKey },
          parsedData
        );

        return res.json(wrapper);
      }

      await incrementCacheStat(resourceType, 'misses');

      req.cacheInfo = {
        redisKey,
        resourceType
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      return res.status(500).json({ error: 'Cache check failed' });
    }
  };
};

export const validateHistoryIds = (historyEntries) => {
  const validEntries = [];

  for (const entry of historyEntries) {
    const [idStr] = entry.split(':');
    const id = parseInt(idStr, 10);

    if (!isNaN(id) && id > 0) {
      validEntries.push(entry);
    }
  }

  return validEntries;
};
