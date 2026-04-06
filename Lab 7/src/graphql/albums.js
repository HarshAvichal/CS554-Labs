import { gql } from '@apollo/client';

const ALBUM_LIST_FIELDS = gql`
  fragment AlbumListFields on Album {
    _id
    title
    genre
    track_count
    artist {
      _id
      stage_name
    }
  }
`;

export const ALBUMS_QUERY = gql`
  query Albums {
    albums {
      ...AlbumListFields
    }
  }
  ${ALBUM_LIST_FIELDS}
`;

export const GET_ALBUMS_BY_GENRE = gql`
  query GetAlbumsByGenre($genre: String!) {
    getAlbumsByGenre(genre: $genre) {
      ...AlbumListFields
    }
  }
  ${ALBUM_LIST_FIELDS}
`;

export const GET_ALBUMS_BY_PROMO_DATE_RANGE = gql`
  query GetAlbumsByPromoDateRange($start: String!, $end: String!) {
    getAlbumsByPromoDateRange(start: $start, end: $end) {
      ...AlbumListFields
    }
  }
  ${ALBUM_LIST_FIELDS}
`;

export const ADD_ALBUM = gql`
  mutation AddAlbum(
    $title: String!
    $genre: String!
    $track_count: Int!
    $artist: String!
    $release_date: String!
    $promo_start: String!
    $promo_end: String!
  ) {
    addAlbum(
      title: $title
      genre: $genre
      track_count: $track_count
      artist: $artist
      release_date: $release_date
      promo_start: $promo_start
      promo_end: $promo_end
    ) {
      _id
      title
    }
  }
`;

export const EDIT_ALBUM = gql`
  mutation EditAlbum(
    $_id: String!
    $title: String
    $genre: String
    $track_count: Int
    $artist: String
    $release_date: String
    $promo_start: String
    $promo_end: String
  ) {
    editAlbum(
      _id: $_id
      title: $title
      genre: $genre
      track_count: $track_count
      artist: $artist
      release_date: $release_date
      promo_start: $promo_start
      promo_end: $promo_end
    ) {
      _id
      title
    }
  }
`;

export const REMOVE_ALBUM = gql`
  mutation RemoveAlbum($_id: String!) {
    removeAlbum(_id: $_id) {
      _id
    }
  }
`;
