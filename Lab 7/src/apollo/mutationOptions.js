import { ARTISTS_QUERY } from '../graphql/artists.js';
import { ALBUMS_QUERY } from '../graphql/albums.js';
import { LISTENERS_QUERY } from '../graphql/listeners.js';

/** Refetch mounted queries after a write (forms, detail pages). */
export const defaultMutationOpts = {
  awaitRefetchQueries: true,
  refetchQueries: 'active',
};

/**
 * After removing an artist, album, or listener, refresh the three root lists so
 * related data stays consistent (e.g. albums show no artist; favorites drop
 * deleted albums) without relying only on whatever page is open.
 */
export const afterEntityDeletedMutationOpts = {
  awaitRefetchQueries: true,
  refetchQueries: [ARTISTS_QUERY, ALBUMS_QUERY, LISTENERS_QUERY],
};
