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
});

console.log(`GraphQL server ready at ${url}`);
