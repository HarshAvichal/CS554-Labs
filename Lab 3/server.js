import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { connectDB } from './config/mongoConnection.js';
import { initRedis } from './config/redisClient.js';

await connectDB();
await initRedis();

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  // Lab 7 (Vite) runs on another origin; browsers block fetch without CORS.
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  },
});

console.log(`GraphQL server ready at ${url}`);
