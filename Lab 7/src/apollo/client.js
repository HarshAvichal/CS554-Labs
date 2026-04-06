import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

/** In dev, prefer Vite proxy (see vite.config.js) unless VITE_GRAPHQL_URL is set. */
function graphqlHttpUri() {
  if (import.meta.env.VITE_GRAPHQL_URL) {
    return import.meta.env.VITE_GRAPHQL_URL;
  }
  if (import.meta.env.DEV) {
    return `${window.location.origin}/lab3graphql`;
  }
  return 'http://localhost:4000/';
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlHttpUri() }),
  cache: new InMemoryCache(),
});
