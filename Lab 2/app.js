import express from 'express';
import redisClient from './config/redis.js';
import pokemonRouter from './routes/pokemon.js';
import abilitiesRouter from './routes/abilities.js';
import movesRouter from './routes/moves.js';
import cacheStatsRouter from './routes/cacheStats.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/pokemon', pokemonRouter);
app.use('/api/abilities', abilitiesRouter);
app.use('/api/moves', movesRouter);
app.use('/api/cache', cacheStatsRouter);

const startServer = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Cache stats available at http://localhost:${PORT}/api/cache/stats`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

startServer();
