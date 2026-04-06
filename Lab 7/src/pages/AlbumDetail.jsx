import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_ALBUM_BY_ID,
  GET_LISTENERS_BY_ALBUM_ID,
  EDIT_ALBUM,
  REMOVE_ALBUM,
  UPDATE_ALBUM_ARTIST,
} from '../graphql/albums.js';
import { ARTISTS_QUERY } from '../graphql/artists.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import {
  afterEntityDeletedMutationOpts,
  defaultMutationOpts,
} from '../apollo/mutationOptions.js';
import Modal from '../components/Modal.jsx';
import AlbumForm from '../components/AlbumForm.jsx';

function ListenerList({ listeners, emptyLabel }) {
  if (!listeners?.length) {
    return <p className="muted">{emptyLabel}</p>;
  }
  return (
    <ul className="album-mini-list">
      {listeners.map((L) => (
        <li key={L._id}>
          <Link to={`/listeners/${L._id}`} className="album-mini-list__title">
            {[L.first_name, L.last_name].filter(Boolean).join(' ') || 'Listener'}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modal, setModal] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');
  const [artistPick, setArtistPick] = useState('');
  const [artistModalError, setArtistModalError] = useState('');

  const [editAlbum, editState] = useMutation(EDIT_ALBUM, defaultMutationOpts);
  const [removeAlbum, removeState] = useMutation(REMOVE_ALBUM, afterEntityDeletedMutationOpts);
  const [updateAlbumArtist, updateArtistState] = useMutation(
    UPDATE_ALBUM_ARTIST,
    defaultMutationOpts
  );

  const albumQ = useQuery(GET_ALBUM_BY_ID, {
    variables: { _id: id },
    skip: !id,
  });

  const listenersQ = useQuery(GET_LISTENERS_BY_ALBUM_ID, {
    variables: { albumId: id },
    skip: !id,
  });

  const artistsQ = useQuery(ARTISTS_QUERY, { skip: !modal });

  const album = albumQ.data?.getAlbumById;
  const fromField = album?.listenersWhoFavorited ?? [];
  const fromQuery = listenersQ.data?.getListenersByAlbumId ?? [];

  const openEdit = () => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal('edit');
  };

  const openUpdateArtist = () => {
    setArtistModalError('');
    setArtistPick('');
    setModal('artist');
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
    setArtistModalError('');
  };

  const handleEdit = async (values) => {
    if (!album?._id) return;
    setFormError('');
    const artistTrim = values.artistId?.trim();
    const variables = {
      _id: album._id,
      title: values.title.trim(),
      genre: values.genre.trim(),
      track_count: values.track_count,
      release_date: values.release_date.trim(),
      promo_start: values.promo_start.trim(),
      promo_end: values.promo_end.trim(),
    };
    if (artistTrim) variables.artist = artistTrim;
    try {
      await editAlbum({ variables });
      closeModal();
    } catch (err) {
      setFormError(formatGraphQLError(err));
    }
  };

  const handleDelete = async () => {
    if (!album?._id) return;
    if (!window.confirm(`Remove ${album.title || 'this album'}?`)) return;
    try {
      await removeAlbum({ variables: { _id: album._id } });
      navigate('/albums');
    } catch (err) {
      alert(formatGraphQLError(err));
    }
  };

  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    if (!album?._id) return;
    setArtistModalError('');
    const artistId = artistPick.trim();
    if (!artistId) {
      setArtistModalError('Choose an artist.');
      return;
    }
    try {
      await updateAlbumArtist({
        variables: { albumId: album._id, artistId },
      });
      closeModal();
    } catch (err) {
      setArtistModalError(formatGraphQLError(err));
    }
  };

  const busy = editState.loading || removeState.loading || updateArtistState.loading;

  return (
    <article className="page page--wide">
      <p className="back-row">
        <Link to="/albums" className="text-back">
          ← Albums
        </Link>
      </p>

      {albumQ.error ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(albumQ.error)}
        </p>
      ) : null}

      {albumQ.loading && !album ? <p className="muted">Loading…</p> : null}

      {!albumQ.loading && !albumQ.error && !album ? (
        <p className="muted">No album data.</p>
      ) : null}

      {album ? (
        <>
          <header className="page-toolbar detail-toolbar">
            <div>
              <h1 className="page-title">{album.title || 'Album'}</h1>
              <p className="muted page-lead">
                {album.genre || '—'} · {album.track_count ?? '—'} tracks
              </p>
            </div>
            <div className="detail-actions">
              <button type="button" className="btn btn--ghost" onClick={openEdit} disabled={busy}>
                Edit
              </button>
              <button type="button" className="btn btn--secondary" onClick={openUpdateArtist} disabled={busy}>
                Update artist
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDelete}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </header>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Details</h2>
            <dl className="detail-dl">
              <div>
                <dt>Artist</dt>
                <dd>
                  {album.artist?._id ? (
                    <Link to={`/artists/${album.artist._id}`}>{album.artist.stage_name || 'Artist'}</Link>
                  ) : (
                    'No Artist Assigned'
                  )}
                </dd>
              </div>
              <div>
                <dt>Release date</dt>
                <dd>{album.release_date || '—'}</dd>
              </div>
              <div>
                <dt>Promo start</dt>
                <dd>{album.promo_start || '—'}</dd>
              </div>
              <div>
                <dt>Promo end</dt>
                <dd>{album.promo_end || '—'}</dd>
              </div>
              <div>
                <dt>
                  Listeners who favorited <span className="computed-tag">computed</span>
                </dt>
                <dd>
                  <strong>{album.numOfListenersWhoFavorited ?? '—'}</strong>
                  <span className="muted"> (numOfListenersWhoFavorited)</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Listeners from album field</h2>
            <p className="muted subsection-note">
              Resolver: <code>Album.listenersWhoFavorited</code>
            </p>
            <ListenerList
              listeners={fromField}
              emptyLabel="No listeners have favorited this album."
            />
          </section>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Listeners from getListenersByAlbumId</h2>
            <p className="muted subsection-note">
              Query: <code>getListenersByAlbumId</code>
            </p>
            {listenersQ.error ? (
              <p className="form-error" role="alert">
                {formatGraphQLError(listenersQ.error)}
              </p>
            ) : listenersQ.loading && fromQuery.length === 0 ? (
              <p className="muted">Loading…</p>
            ) : (
              <ListenerList
                listeners={fromQuery}
                emptyLabel="No listeners returned for this album."
              />
            )}
          </section>
        </>
      ) : null}

      <Modal title="Edit album" isOpen={modal === 'edit'} onClose={closeModal}>
        <AlbumForm
          key={formNonce}
          mode="edit"
          initial={album}
          artists={artistsQ.data?.artists}
          artistsLoading={artistsQ.loading}
          submitting={editState.loading}
          errorText={formError}
          onSubmit={handleEdit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal title="Update album artist" isOpen={modal === 'artist'} onClose={closeModal}>
        <form className="stack-form" onSubmit={handleUpdateArtist}>
          {artistModalError ? (
            <p className="form-error" role="alert">
              {artistModalError}
            </p>
          ) : null}
          <label className="field">
            <span>Artist</span>
            {artistsQ.loading ? (
              <p className="muted">Loading artists…</p>
            ) : (
              <select
                value={artistPick}
                onChange={(e) => setArtistPick(e.target.value)}
                required
              >
                <option value="">Select an artist</option>
                {artistsQ.data?.artists?.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.stage_name || a._id}
                  </option>
                ))}
              </select>
            )}
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={updateArtistState.loading || artistsQ.loading}
            >
              {updateArtistState.loading ? 'Saving…' : 'Assign artist'}
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
