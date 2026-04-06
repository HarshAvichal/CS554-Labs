import { createClient } from 'redis';

let client = null;

export const initRedis = async () => {
  try {
    client = createClient();
    client.on('error', () => {});
    await client.connect();
    console.log('Connected to Redis');
  } catch {
    client = null;
    console.log('Redis not available — running without cache');
  }
};

export const getCache = async (key) => {
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, data) => {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(data));
  } catch {
  }
};

export const flushCache = async () => {
  if (!client) return;
  try {
    await client.flushAll();
  } catch {
  }
};
