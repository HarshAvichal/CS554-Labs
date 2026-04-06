import { GraphQLError } from 'graphql';
import { ObjectId } from 'mongodb';
import { connectDB } from './config/mongoConnection.js';
import { getCache, setCache, flushCache } from './config/redisClient.js';
import {
  isValidEmail,
  isValidPhone,
  isValidDate,
  parseDate,
  calcAge,
  isValidObjectId,
} from './helpers/validation.js';

const normalize = (doc) => {
  if (!doc) return null;
  const out = { ...doc };
  if (out._id != null && typeof out._id !== 'string') {
    out._id = out._id.toString();
  }
  if (out.artist != null && typeof out.artist !== 'string') {
    out.artist = out.artist.toString();
  }
  if (Array.isArray(out.favorite_albums)) {
    out.favorite_albums = out.favorite_albums.map((id) =>
      typeof id === 'string' ? id : id.toString()
    );
  }
  return out;
};

const toObjectId = (id) => new ObjectId(id);

const requireDate = (value, fieldName, checkYear = false) => {
  if (!isValidDate(value)) {
    throw new GraphQLError(`${fieldName} must be a valid date in MM/DD/YYYY format`);
  }
  if (checkYear) {
    const [, , yyyy] = value.split('/').map(Number);
    if (yyyy < 1900) {
      throw new GraphQLError(`${fieldName}: year must be >= 1900`);
    }
  }
};

const validateAlbumDateOrdering = (releaseDate, promoStart, promoEnd) => {
  const rel = parseDate(releaseDate);
  const pStart = parseDate(promoStart);
  const pEnd = parseDate(promoEnd);
  if (pStart < rel) {
    throw new GraphQLError('promo_start must be on or after release_date');
  }
  if (pEnd <= pStart) {
    throw new GraphQLError('promo_end must be after promo_start');
  }
};

const requireTrimmed = (value, fieldName) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new GraphQLError(`${fieldName} cannot be empty`);
  }
  return trimmed;
};

export const resolvers = {
  Query: {
    artists: async () => {
      const cached = await getCache('artists');
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db.collection('artists').find({}).toArray();
      const result = docs.map(normalize);
      await setCache('artists', result);
      return result;
    },

    albums: async () => {
      const cached = await getCache('albums');
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db.collection('albums').find({}).toArray();
      const result = docs.map(normalize);
      await setCache('albums', result);
      return result;
    },

    listeners: async () => {
      const cached = await getCache('listeners');
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db.collection('listeners').find({}).toArray();
      const result = docs.map(normalize);
      await setCache('listeners', result);
      return result;
    },

    getArtistById: async (_, { _id }) => {
      if (!isValidObjectId(_id)) {
        throw new GraphQLError('Invalid artist ID');
      }
      const cacheKey = `getArtistById:${_id}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const doc = await db.collection('artists').findOne({ _id: toObjectId(_id) });
      if (!doc) throw new GraphQLError(`No artist found with id ${_id}`);
      const result = normalize(doc);
      await setCache(cacheKey, result);
      return result;
    },

    getListenerById: async (_, { _id }) => {
      if (!isValidObjectId(_id)) {
        throw new GraphQLError('Invalid listener ID');
      }
      const cacheKey = `getListenerById:${_id}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const doc = await db.collection('listeners').findOne({ _id: toObjectId(_id) });
      if (!doc) throw new GraphQLError(`No listener found with id ${_id}`);
      const result = normalize(doc);
      await setCache(cacheKey, result);
      return result;
    },

    getAlbumById: async (_, { _id }) => {
      if (!isValidObjectId(_id)) {
        throw new GraphQLError('Invalid album ID');
      }
      const cacheKey = `getAlbumById:${_id}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const doc = await db.collection('albums').findOne({ _id: toObjectId(_id) });
      if (!doc) throw new GraphQLError(`No album found with id ${_id}`);
      const result = normalize(doc);
      await setCache(cacheKey, result);
      return result;
    },

    getAlbumsByArtistId: async (_, { artistId }) => {
      if (!isValidObjectId(artistId)) {
        throw new GraphQLError('Invalid artist ID');
      }
      const cacheKey = `getAlbumsByArtistId:${artistId}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const artist = await db.collection('artists').findOne({ _id: toObjectId(artistId) });
      if (!artist) throw new GraphQLError(`No artist found with id ${artistId}`);
      const docs = await db.collection('albums').find({ artist: toObjectId(artistId) }).toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },

    getListenersByAlbumId: async (_, { albumId }) => {
      if (!isValidObjectId(albumId)) {
        throw new GraphQLError('Invalid album ID');
      }
      const cacheKey = `getListenersByAlbumId:${albumId}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const album = await db.collection('albums').findOne({ _id: toObjectId(albumId) });
      if (!album) throw new GraphQLError(`No album found with id ${albumId}`);
      const docs = await db
        .collection('listeners')
        .find({ favorite_albums: toObjectId(albumId) })
        .toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },

    getAlbumsByGenre: async (_, { genre }) => {
      const trimmed = genre.trim();
      if (!trimmed) throw new GraphQLError('genre cannot be empty');
      const cacheKey = `getAlbumsByGenre:${trimmed.toLowerCase()}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db
        .collection('albums')
        .find({ genre: { $regex: new RegExp(`^${trimmed}$`, 'i') } })
        .toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },

    getArtistsByLabel: async (_, { label }) => {
      const trimmed = label.trim();
      if (!trimmed) throw new GraphQLError('label cannot be empty');
      const cacheKey = `getArtistsByLabel:${trimmed.toLowerCase()}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db
        .collection('artists')
        .find({ label: { $regex: new RegExp(`^${trimmed}$`, 'i') } })
        .toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },

    getListenersBySubscription: async (_, { tier }) => {
      const normalized = tier.trim().toUpperCase();
      if (normalized !== 'FREE' && normalized !== 'PREMIUM') {
        throw new GraphQLError('tier must be FREE or PREMIUM');
      }
      const cacheKey = `getListenersBySubscription:${normalized}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db
        .collection('listeners')
        .find({ subscription_tier: normalized })
        .toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },

    getArtistsSignedBetween: async (_, { start, end }) => {
      requireDate(start, 'start');
      requireDate(end, 'end');
      const startDate = parseDate(start);
      const endDate = parseDate(end);
      if (startDate > endDate) {
        throw new GraphQLError('start date must be on or before end date');
      }
      const db = await connectDB();
      const all = await db.collection('artists').find({}).toArray();
      const filtered = all.filter((a) => {
        if (!isValidDate(a.date_signed)) return false;
        const signed = parseDate(a.date_signed);
        return signed >= startDate && signed <= endDate;
      });
      return filtered.map(normalize);
    },

    getAlbumsByPromoDateRange: async (_, { start, end }) => {
      requireDate(start, 'start');
      requireDate(end, 'end');
      const startDate = parseDate(start);
      const endDate = parseDate(end);
      if (startDate > endDate) {
        throw new GraphQLError('start date must be on or before end date');
      }
      const db = await connectDB();
      const all = await db.collection('albums').find({}).toArray();
      const filtered = all.filter((a) => {
        if (!isValidDate(a.promo_start) || !isValidDate(a.promo_end)) return false;
        const pStart = parseDate(a.promo_start);
        const pEnd = parseDate(a.promo_end);
        return pStart >= startDate && pEnd <= endDate;
      });
      return filtered.map(normalize);
    },

    searchListenersByLastName: async (_, { searchTerm }) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) throw new GraphQLError('searchTerm cannot be empty');
      const cacheKey = `searchListenersByLastName:${trimmed.toLowerCase()}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;
      const db = await connectDB();
      const docs = await db
        .collection('listeners')
        .find({ last_name: { $regex: new RegExp(trimmed, 'i') } })
        .toArray();
      const result = docs.map(normalize);
      await setCache(cacheKey, result);
      return result;
    },
  },

  Mutation: {
    addArtist: async (_, args) => {
      const stage_name = requireTrimmed(args.stage_name, 'stage_name');
      const genre = requireTrimmed(args.genre, 'genre');
      const label = requireTrimmed(args.label, 'label');
      const management_email = requireTrimmed(args.management_email, 'management_email');
      const management_phone = requireTrimmed(args.management_phone, 'management_phone');
      const home_city = requireTrimmed(args.home_city, 'home_city');
      const date_signed = requireTrimmed(args.date_signed, 'date_signed');

      if (!isValidEmail(management_email)) {
        throw new GraphQLError('management_email must be a valid email address');
      }
      if (!isValidPhone(management_phone)) {
        throw new GraphQLError('management_phone must be in ###-###-#### format');
      }
      requireDate(date_signed, 'date_signed', true);

      const db = await connectDB();
      const doc = { stage_name, genre, label, management_email, management_phone, home_city, date_signed };
      const { insertedId } = await db.collection('artists').insertOne(doc);
      await flushCache();
      return normalize({ ...doc, _id: insertedId });
    },

    editArtist: async (_, args) => {
      const { _id, ...rest } = args;
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid artist ID');

      const updates = {};
      for (const [key, value] of Object.entries(rest)) {
        if (value === undefined || value === null) continue;
        const trimmed = value.trim();
        if (!trimmed) throw new GraphQLError(`${key} cannot be empty`);
        updates[key] = trimmed;
      }

      if (Object.keys(updates).length === 0) {
        throw new GraphQLError('At least one field other than _id must be provided');
      }

      if (updates.management_email && !isValidEmail(updates.management_email)) {
        throw new GraphQLError('management_email must be a valid email address');
      }
      if (updates.management_phone && !isValidPhone(updates.management_phone)) {
        throw new GraphQLError('management_phone must be in ###-###-#### format');
      }
      if (updates.date_signed) {
        requireDate(updates.date_signed, 'date_signed', true);
      }

      const db = await connectDB();
      const existing = await db.collection('artists').findOne({ _id: toObjectId(_id) });
      if (!existing) throw new GraphQLError(`No artist found with id ${_id}`);

      const updated = await db.collection('artists').findOneAndUpdate(
        { _id: toObjectId(_id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },

    removeArtist: async (_, { _id }) => {
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid artist ID');
      const db = await connectDB();
      const artist = await db.collection('artists').findOne({ _id: toObjectId(_id) });
      if (!artist) throw new GraphQLError(`No artist found with id ${_id}`);

      await db.collection('artists').deleteOne({ _id: toObjectId(_id) });
      await db.collection('albums').updateMany(
        { artist: toObjectId(_id) },
        { $set: { artist: null } }
      );
      await flushCache();
      return normalize(artist);
    },

    addAlbum: async (_, args) => {
      const title = requireTrimmed(args.title, 'title');
      const genre = requireTrimmed(args.genre, 'genre');
      const artistId = requireTrimmed(args.artist, 'artist');
      const release_date = requireTrimmed(args.release_date, 'release_date');
      const promo_start = requireTrimmed(args.promo_start, 'promo_start');
      const promo_end = requireTrimmed(args.promo_end, 'promo_end');
      const track_count = args.track_count;

      if (!Number.isInteger(track_count) || track_count < 1 || track_count > 200) {
        throw new GraphQLError('track_count must be a whole number between 1 and 200');
      }
      if (!isValidObjectId(artistId)) throw new GraphQLError('Invalid artist ID');

      requireDate(release_date, 'release_date');
      requireDate(promo_start, 'promo_start');
      requireDate(promo_end, 'promo_end');
      validateAlbumDateOrdering(release_date, promo_start, promo_end);

      const db = await connectDB();
      const artist = await db.collection('artists').findOne({ _id: toObjectId(artistId) });
      if (!artist) throw new GraphQLError(`No artist found with id ${artistId}`);

      const doc = {
        title,
        genre,
        track_count,
        artist: toObjectId(artistId),
        release_date,
        promo_start,
        promo_end,
      };
      const { insertedId } = await db.collection('albums').insertOne(doc);
      await flushCache();
      return normalize({ ...doc, _id: insertedId });
    },

    editAlbum: async (_, args) => {
      const { _id, track_count, artist: artistArg, ...rest } = args;
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid album ID');

      const updates = {};

      for (const [key, value] of Object.entries(rest)) {
        if (value === undefined || value === null) continue;
        const trimmed = value.trim();
        if (!trimmed) throw new GraphQLError(`${key} cannot be empty`);
        updates[key] = trimmed;
      }

      if (track_count !== undefined && track_count !== null) {
        if (!Number.isInteger(track_count) || track_count < 1 || track_count > 200) {
          throw new GraphQLError('track_count must be a whole number between 1 and 200');
        }
        updates.track_count = track_count;
      }

      if (artistArg !== undefined && artistArg !== null) {
        const trimmedArtistId = artistArg.trim();
        if (!trimmedArtistId) throw new GraphQLError('artist cannot be empty');
        if (!isValidObjectId(trimmedArtistId)) throw new GraphQLError('Invalid artist ID');
        updates.artist = toObjectId(trimmedArtistId);
      }

      if (Object.keys(updates).length === 0) {
        throw new GraphQLError('At least one field other than _id must be provided');
      }

      const db = await connectDB();

      if (updates.artist) {
        const artistExists = await db.collection('artists').findOne({ _id: updates.artist });
        if (!artistExists) throw new GraphQLError(`No artist found with id ${artistArg.trim()}`);
      }
      const current = await db.collection('albums').findOne({ _id: toObjectId(_id) });
      if (!current) throw new GraphQLError(`No album found with id ${_id}`);

      if (updates.release_date) requireDate(updates.release_date, 'release_date');
      if (updates.promo_start) requireDate(updates.promo_start, 'promo_start');
      if (updates.promo_end) requireDate(updates.promo_end, 'promo_end');

      if (updates.release_date || updates.promo_start || updates.promo_end) {
        const mergedRelease = updates.release_date || current.release_date;
        const mergedPromoStart = updates.promo_start || current.promo_start;
        const mergedPromoEnd = updates.promo_end || current.promo_end;
        validateAlbumDateOrdering(mergedRelease, mergedPromoStart, mergedPromoEnd);
      }

      const updated = await db.collection('albums').findOneAndUpdate(
        { _id: toObjectId(_id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },

    removeAlbum: async (_, { _id }) => {
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid album ID');
      const db = await connectDB();
      const album = await db.collection('albums').findOne({ _id: toObjectId(_id) });
      if (!album) throw new GraphQLError(`No album found with id ${_id}`);

      await db.collection('albums').deleteOne({ _id: toObjectId(_id) });
      await db.collection('listeners').updateMany(
        { favorite_albums: toObjectId(_id) },
        { $pull: { favorite_albums: toObjectId(_id) } }
      );
      await flushCache();
      return normalize(album);
    },

    addListener: async (_, args) => {
      const first_name = requireTrimmed(args.first_name, 'first_name');
      const last_name = requireTrimmed(args.last_name, 'last_name');
      const email = requireTrimmed(args.email, 'email');
      const date_of_birth = requireTrimmed(args.date_of_birth, 'date_of_birth');
      const subscription_tier = requireTrimmed(args.subscription_tier, 'subscription_tier').toUpperCase();

      if (!isValidEmail(email)) {
        throw new GraphQLError('email must be a valid email address');
      }
      requireDate(date_of_birth, 'date_of_birth');
      const age = calcAge(date_of_birth);
      if (age < 13 || age > 120) {
        throw new GraphQLError('Listener age must be between 13 and 120');
      }
      if (subscription_tier !== 'FREE' && subscription_tier !== 'PREMIUM') {
        throw new GraphQLError('subscription_tier must be FREE or PREMIUM');
      }

      const db = await connectDB();
      const doc = {
        first_name,
        last_name,
        email,
        date_of_birth,
        subscription_tier,
        favorite_albums: [],
      };
      const { insertedId } = await db.collection('listeners').insertOne(doc);
      await flushCache();
      return normalize({ ...doc, _id: insertedId });
    },

    editListener: async (_, args) => {
      const { _id, ...rest } = args;
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid listener ID');

      const updates = {};
      for (const [key, value] of Object.entries(rest)) {
        if (value === undefined || value === null) continue;
        const trimmed = value.trim();
        if (!trimmed) throw new GraphQLError(`${key} cannot be empty`);
        updates[key] = trimmed;
      }

      if (Object.keys(updates).length === 0) {
        throw new GraphQLError('At least one field other than _id must be provided');
      }

      if (updates.email && !isValidEmail(updates.email)) {
        throw new GraphQLError('email must be a valid email address');
      }
      if (updates.date_of_birth) {
        requireDate(updates.date_of_birth, 'date_of_birth');
        const age = calcAge(updates.date_of_birth);
        if (age < 13 || age > 120) {
          throw new GraphQLError('Listener age must be between 13 and 120');
        }
      }
      if (updates.subscription_tier) {
        updates.subscription_tier = updates.subscription_tier.toUpperCase();
        if (updates.subscription_tier !== 'FREE' && updates.subscription_tier !== 'PREMIUM') {
          throw new GraphQLError('subscription_tier must be FREE or PREMIUM');
        }
      }

      const db = await connectDB();
      const existing = await db.collection('listeners').findOne({ _id: toObjectId(_id) });
      if (!existing) throw new GraphQLError(`No listener found with id ${_id}`);

      const updated = await db.collection('listeners').findOneAndUpdate(
        { _id: toObjectId(_id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },

    removeListener: async (_, { _id }) => {
      if (!isValidObjectId(_id)) throw new GraphQLError('Invalid listener ID');
      const db = await connectDB();
      const listener = await db.collection('listeners').findOne({ _id: toObjectId(_id) });
      if (!listener) throw new GraphQLError(`No listener found with id ${_id}`);

      await db.collection('listeners').deleteOne({ _id: toObjectId(_id) });
      await flushCache();
      return normalize(listener);
    },

    updateAlbumArtist: async (_, { albumId, artistId }) => {
      if (!isValidObjectId(albumId)) throw new GraphQLError('Invalid album ID');
      if (!isValidObjectId(artistId)) throw new GraphQLError('Invalid artist ID');

      const db = await connectDB();
      const album = await db.collection('albums').findOne({ _id: toObjectId(albumId) });
      if (!album) throw new GraphQLError(`No album found with id ${albumId}`);
      const artist = await db.collection('artists').findOne({ _id: toObjectId(artistId) });
      if (!artist) throw new GraphQLError(`No artist found with id ${artistId}`);

      const updated = await db.collection('albums').findOneAndUpdate(
        { _id: toObjectId(albumId) },
        { $set: { artist: toObjectId(artistId) } },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },

    favoriteAlbum: async (_, { listenerId, albumId }) => {
      if (!isValidObjectId(listenerId)) throw new GraphQLError('Invalid listener ID');
      if (!isValidObjectId(albumId)) throw new GraphQLError('Invalid album ID');

      const db = await connectDB();
      const listener = await db.collection('listeners').findOne({ _id: toObjectId(listenerId) });
      if (!listener) throw new GraphQLError(`No listener found with id ${listenerId}`);
      const album = await db.collection('albums').findOne({ _id: toObjectId(albumId) });
      if (!album) throw new GraphQLError(`No album found with id ${albumId}`);

      const updated = await db.collection('listeners').findOneAndUpdate(
        { _id: toObjectId(listenerId) },
        { $addToSet: { favorite_albums: toObjectId(albumId) } },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },

    unfavoriteAlbum: async (_, { listenerId, albumId }) => {
      if (!isValidObjectId(listenerId)) throw new GraphQLError('Invalid listener ID');
      if (!isValidObjectId(albumId)) throw new GraphQLError('Invalid album ID');

      const db = await connectDB();
      const listener = await db.collection('listeners').findOne({ _id: toObjectId(listenerId) });
      if (!listener) throw new GraphQLError(`No listener found with id ${listenerId}`);
      const album = await db.collection('albums').findOne({ _id: toObjectId(albumId) });
      if (!album) throw new GraphQLError(`No album found with id ${albumId}`);

      const updated = await db.collection('listeners').findOneAndUpdate(
        { _id: toObjectId(listenerId) },
        { $pull: { favorite_albums: toObjectId(albumId) } },
        { returnDocument: 'after' }
      );
      await flushCache();
      return normalize(updated);
    },
  },

  Artist: {
    albums: async (parent) => {
      const db = await connectDB();
      const docs = await db
        .collection('albums')
        .find({ artist: toObjectId(parent._id) })
        .toArray();
      return docs.map(normalize);
    },

    numOfAlbums: async (parent) => {
      const db = await connectDB();
      return db.collection('albums').countDocuments({ artist: toObjectId(parent._id) });
    },
  },

  Album: {
    artist: async (parent) => {
      if (!parent.artist) return null;
      const db = await connectDB();
      const doc = await db.collection('artists').findOne({ _id: toObjectId(parent.artist) });
      return doc ? normalize(doc) : null;
    },

    listenersWhoFavorited: async (parent) => {
      const db = await connectDB();
      const docs = await db
        .collection('listeners')
        .find({ favorite_albums: toObjectId(parent._id) })
        .toArray();
      return docs.map(normalize);
    },

    numOfListenersWhoFavorited: async (parent) => {
      const db = await connectDB();
      return db
        .collection('listeners')
        .countDocuments({ favorite_albums: toObjectId(parent._id) });
    },
  },

  Listener: {
    favorite_albums: async (parent) => {
      if (!parent.favorite_albums || parent.favorite_albums.length === 0) return [];
      const db = await connectDB();
      const ids = parent.favorite_albums.map(toObjectId);
      const docs = await db.collection('albums').find({ _id: { $in: ids } }).toArray();
      return docs.map(normalize);
    },

    numOfFavoriteAlbums: (parent) => {
      return Array.isArray(parent.favorite_albums) ? parent.favorite_albums.length : 0;
    },
  },
};
