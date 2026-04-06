import { gql } from '@apollo/client';

const ARTIST_LIST_FIELDS = gql`
  fragment ArtistListFields on Artist {
    _id
    stage_name
    genre
    label
    numOfAlbums
  }
`;

export const ARTISTS_QUERY = gql`
  query Artists {
    artists {
      ...ArtistListFields
    }
  }
  ${ARTIST_LIST_FIELDS}
`;

export const GET_ARTISTS_BY_LABEL = gql`
  query GetArtistsByLabel($label: String!) {
    getArtistsByLabel(label: $label) {
      ...ArtistListFields
    }
  }
  ${ARTIST_LIST_FIELDS}
`;

export const GET_ARTISTS_SIGNED_BETWEEN = gql`
  query GetArtistsSignedBetween($start: String!, $end: String!) {
    getArtistsSignedBetween(start: $start, end: $end) {
      ...ArtistListFields
    }
  }
  ${ARTIST_LIST_FIELDS}
`;

export const ADD_ARTIST = gql`
  mutation AddArtist(
    $stage_name: String!
    $genre: String!
    $label: String!
    $management_email: String!
    $management_phone: String!
    $home_city: String!
    $date_signed: String!
  ) {
    addArtist(
      stage_name: $stage_name
      genre: $genre
      label: $label
      management_email: $management_email
      management_phone: $management_phone
      home_city: $home_city
      date_signed: $date_signed
    ) {
      _id
      stage_name
    }
  }
`;

export const EDIT_ARTIST = gql`
  mutation EditArtist(
    $_id: String!
    $stage_name: String
    $genre: String
    $label: String
    $management_email: String
    $management_phone: String
    $home_city: String
    $date_signed: String
  ) {
    editArtist(
      _id: $_id
      stage_name: $stage_name
      genre: $genre
      label: $label
      management_email: $management_email
      management_phone: $management_phone
      home_city: $home_city
      date_signed: $date_signed
    ) {
      _id
      stage_name
    }
  }
`;

export const REMOVE_ARTIST = gql`
  mutation RemoveArtist($_id: String!) {
    removeArtist(_id: $_id) {
      _id
    }
  }
`;

const ALBUM_CARD_FIELDS = gql`
  fragment AlbumCardFields on Album {
    _id
    title
    genre
    track_count
  }
`;

export const GET_ARTIST_BY_ID = gql`
  query GetArtistById($_id: String!) {
    getArtistById(_id: $_id) {
      _id
      stage_name
      genre
      label
      management_email
      management_phone
      home_city
      date_signed
      numOfAlbums
      albums {
        ...AlbumCardFields
      }
    }
  }
  ${ALBUM_CARD_FIELDS}
`;

export const GET_ALBUMS_BY_ARTIST_ID = gql`
  query GetAlbumsByArtistId($artistId: String!) {
    getAlbumsByArtistId(artistId: $artistId) {
      ...AlbumCardFields
    }
  }
  ${ALBUM_CARD_FIELDS}
`;
