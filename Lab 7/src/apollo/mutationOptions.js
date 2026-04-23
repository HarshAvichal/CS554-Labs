import { ARTISTS_QUERY } from '../graphql/artists.js';
import { ALBUMS_QUERY } from '../graphql/albums.js';
import { LISTENERS_QUERY } from '../graphql/listeners.js';

export const defaultMutationOpts = {
  awaitRefetchQueries: true,
  refetchQueries: 'active',
};

/** After a delete mutation, refetch root lists so related views stay consistent. */
export const afterEntityDeletedMutationOpts = {
  awaitRefetchQueries: true,
  refetchQueries: [ARTISTS_QUERY, ALBUMS_QUERY, LISTENERS_QUERY],
};
