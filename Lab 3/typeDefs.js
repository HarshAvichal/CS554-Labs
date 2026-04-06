export const typeDefs = `#graphql

  type Artist {
    _id: String
    stage_name: String
    genre: String
    label: String
    management_email: String
    management_phone: String
    home_city: String
    date_signed: String
    albums: [Album]
    numOfAlbums: Int
  }

  type Album {
    _id: String
    title: String
    genre: String
    track_count: Int
    artist: Artist
    release_date: String
    promo_start: String
    promo_end: String
    listenersWhoFavorited: [Listener]
    numOfListenersWhoFavorited: Int
  }

  type Listener {
    _id: String
    first_name: String
    last_name: String
    email: String
    date_of_birth: String
    subscription_tier: String
    favorite_albums: [Album]
    numOfFavoriteAlbums: Int
  }

  type Query {
    artists: [Artist]
    listeners: [Listener]
    albums: [Album]

    getArtistById(_id: String!): Artist
    getListenerById(_id: String!): Listener
    getAlbumById(_id: String!): Album

    getAlbumsByArtistId(artistId: String!): [Album]
    getListenersByAlbumId(albumId: String!): [Listener]

    getAlbumsByGenre(genre: String!): [Album]
    getArtistsByLabel(label: String!): [Artist]
    getListenersBySubscription(tier: String!): [Listener]

    getArtistsSignedBetween(start: String!, end: String!): [Artist]
    getAlbumsByPromoDateRange(start: String!, end: String!): [Album]

    searchListenersByLastName(searchTerm: String!): [Listener]
  }

  type Mutation {
    addArtist(
      stage_name: String!
      genre: String!
      label: String!
      management_email: String!
      management_phone: String!
      home_city: String!
      date_signed: String!
    ): Artist

    editArtist(
      _id: String!
      stage_name: String
      genre: String
      label: String
      management_email: String
      management_phone: String
      home_city: String
      date_signed: String
    ): Artist

    removeArtist(_id: String!): Artist

    addAlbum(
      title: String!
      genre: String!
      track_count: Int!
      artist: String!
      release_date: String!
      promo_start: String!
      promo_end: String!
    ): Album

    editAlbum(
      _id: String!
      title: String
      genre: String
      track_count: Int
      artist: String
      release_date: String
      promo_start: String
      promo_end: String
    ): Album

    removeAlbum(_id: String!): Album

    addListener(
      first_name: String!
      last_name: String!
      email: String!
      date_of_birth: String!
      subscription_tier: String!
    ): Listener

    editListener(
      _id: String!
      first_name: String
      last_name: String
      email: String
      date_of_birth: String
      subscription_tier: String
    ): Listener

    removeListener(_id: String!): Listener

    updateAlbumArtist(albumId: String!, artistId: String!): Album

    favoriteAlbum(listenerId: String!, albumId: String!): Listener

    unfavoriteAlbum(listenerId: String!, albumId: String!): Listener
  }
`;
