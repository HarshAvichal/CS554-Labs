import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_LISTENER_BY_ID,
  LISTENERS_QUERY,
  EDIT_LISTENER,
  REMOVE_LISTENER,
  FAVORITE_ALBUM,
  UNFAVORITE_ALBUM,
} from '../graphql/listeners.js';
import { ALBUMS_QUERY } from '../graphql/albums.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import {
  afterEntityDeletedMutationOpts,
  defaultMutationOpts,
} from '../apollo/mutationOptions.js';
import Modal from '../components/Modal.jsx';
import ListenerForm from '../components/ListenerForm.jsx';

function FavoriteAlbumsList({ albums }) {
  if (!albums?.length) {
    return <p className="muted">No Favorite Albums</p>;
  }
  return (
    <ul className="album-mini-list">
      {albums.map((a) => (
        <li key={a._id}>
          <Link to={`/albums/${a._id}`} className="album-mini-list__title">
            {a.title || 'Untitled'}
          </Link>
          <span className="muted">
            {' '}
            · {a.genre || '—'} · {a.track_count ?? '—'} tracks
          </span>
        </li>
      ))}
    </ul>
  );
}

function fullName(L) {
  return [L?.first_name, L?.last_name].filter(Boolean).join(' ') || 'Listener';
}

export default function ListenerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modal, setModal] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');
  const [pickAlbumId, setPickAlbumId] = useState('');
  const [pickError, setPickError] = useState('');

  const [editListener, editState] = useMutation(EDIT_LISTENER, defaultMutationOpts);
  const [removeListener, removeState] = useMutation(
    REMOVE_LISTENER,
    afterEntityDeletedMutationOpts
  );

  const favoriteMutationOpts = useMemo(
    () => ({
      awaitRefetchQueries: true,
      refetchQueries: [
        LISTENERS_QUERY,
        ALBUMS_QUERY,
        { query: GET_LISTENER_BY_ID, variables: { _id: id } },
      ],
    }),
    [id]
  );

  const [favoriteAlbum, favoriteState] = useMutation(FAVORITE_ALBUM, favoriteMutationOpts);
  const [unfavoriteAlbum, unfavoriteState] = useMutation(UNFAVORITE_ALBUM, favoriteMutationOpts);

  const listenerQ = useQuery(GET_LISTENER_BY_ID, {
    variables: { _id: id },
    skip: !id,
  });

  const albumsQ = useQuery(ALBUMS_QUERY, {
    skip: !id || modal !== 'favorite',
  });

  const listener = listenerQ.data?.getListenerById;

  const favoritedIds = useMemo(
    () => new Set((listener?.favorite_albums ?? []).map((a) => a._id).filter(Boolean)),
    [listener?.favorite_albums]
  );

  const albumsToFavorite = useMemo(() => {
    const all = albumsQ.data?.albums ?? [];
    return all.filter((a) => a._id && !favoritedIds.has(a._id));
  }, [albumsQ.data?.albums, favoritedIds]);

  const openEdit = () => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal('edit');
  };

  const openFavorite = () => {
    setPickError('');
    setPickAlbumId('');
    setModal('favorite');
  };

  const openUnfavorite = () => {
    setPickError('');
    setPickAlbumId('');
    setModal('unfavorite');
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
    setPickError('');
    setPickAlbumId('');
  };

  const handleEdit = async (values) => {
    if (!listener?._id) return;
    setFormError('');
    try {
      await editListener({
        variables: {
          _id: listener._id,
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          date_of_birth: values.date_of_birth.trim(),
          subscription_tier: values.subscription_tier.trim(),
        },
      });
      closeModal();
    } catch (err) {
      setFormError(formatGraphQLError(err));
    }
  };

  const handleDelete = async () => {
    if (!listener?._id) return;
    if (!window.confirm(`Remove ${fullName(listener)}?`)) return;
    try {
      await removeListener({ variables: { _id: listener._id } });
      navigate('/listeners');
    } catch (err) {
      alert(formatGraphQLError(err));
    }
  };

  const handleFavoriteSubmit = async (e) => {
    e.preventDefault();
    if (!listener?._id) return;
    setPickError('');
    const albumId = pickAlbumId.trim();
    if (!albumId) {
      setPickError('Choose an album to favorite.');
      return;
    }
    try {
      await favoriteAlbum({
        variables: { listenerId: listener._id, albumId },
      });
      closeModal();
    } catch (err) {
      setPickError(formatGraphQLError(err));
    }
  };

  const handleUnfavoriteSubmit = async (e) => {
    e.preventDefault();
    if (!listener?._id) return;
    setPickError('');
    const albumId = pickAlbumId.trim();
    if (!albumId) {
      setPickError('Choose an album to remove from favorites.');
      return;
    }
    try {
      await unfavoriteAlbum({
        variables: { listenerId: listener._id, albumId },
      });
      closeModal();
    } catch (err) {
      setPickError(formatGraphQLError(err));
    }
  };

  const busy =
    editState.loading ||
    removeState.loading ||
    favoriteState.loading ||
    unfavoriteState.loading;

  const unfavoriteOptions = listener?.favorite_albums ?? [];

  return (
    <article className="page page--wide">
      <p className="back-row">
        <Link to="/listeners" className="text-back">
          ← Listeners
        </Link>
      </p>

      {listenerQ.error ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(listenerQ.error)}
        </p>
      ) : null}

      {listenerQ.loading && !listener ? <p className="muted">Loading…</p> : null}

      {!listenerQ.loading && !listenerQ.error && !listener ? (
        <p className="muted">No listener data.</p>
      ) : null}

      {listener ? (
        <>
          <header className="page-toolbar detail-toolbar">
            <div>
              <h1 className="page-title">{fullName(listener)}</h1>
              <p className="muted page-lead">{listener.subscription_tier || '—'}</p>
            </div>
            <div className="detail-actions">
              <button type="button" className="btn btn--ghost" onClick={openEdit} disabled={busy}>
                Edit
              </button>
              <button type="button" className="btn btn--secondary" onClick={openFavorite} disabled={busy}>
                Favorite
              </button>
              <button type="button" className="btn btn--secondary" onClick={openUnfavorite} disabled={busy}>
                Unfavorite
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
            <h2 className="subsection-title">Profile</h2>
            <dl className="detail-dl">
              <div>
                <dt>Email</dt>
                <dd>{listener.email || '—'}</dd>
              </div>
              <div>
                <dt>Date of birth</dt>
                <dd>{listener.date_of_birth || '—'}</dd>
              </div>
              <div>
                <dt>Subscription tier</dt>
                <dd>{listener.subscription_tier || '—'}</dd>
              </div>
              <div>
                <dt>
                  Favorite album count <span className="computed-tag">computed</span>
                </dt>
                <dd>
                  <strong>{listener.numOfFavoriteAlbums ?? '—'}</strong>
                  <span className="muted"> (numOfFavoriteAlbums)</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Favorite albums</h2>
            <p className="muted subsection-note">
              Resolver: <code>Listener.favorite_albums</code>
            </p>
            <FavoriteAlbumsList albums={listener.favorite_albums} />
          </section>
        </>
      ) : null}

      <Modal title="Edit listener" isOpen={modal === 'edit'} onClose={closeModal}>
        <ListenerForm
          key={formNonce}
          mode="edit"
          initial={listener}
          submitting={editState.loading}
          errorText={formError}
          onSubmit={handleEdit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal title="Favorite an album" isOpen={modal === 'favorite'} onClose={closeModal}>
        <form className="stack-form" onSubmit={handleFavoriteSubmit}>
          {pickError ? (
            <p className="form-error" role="alert">
              {pickError}
            </p>
          ) : null}
          <label className="field">
            <span>Album</span>
            {albumsQ.loading ? (
              <p className="muted">Loading albums…</p>
            ) : albumsToFavorite.length === 0 ? (
              <p className="muted">No albums available to add (all may already be favorited).</p>
            ) : (
              <select
                value={pickAlbumId}
                onChange={(e) => setPickAlbumId(e.target.value)}
                required
              >
                <option value="">Select an album</option>
                {albumsToFavorite.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title || 'Untitled'}
                    {a.genre ? ` · ${a.genre}` : ''}
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
              disabled={favoriteState.loading || albumsQ.loading || albumsToFavorite.length === 0}
            >
              {favoriteState.loading ? 'Saving…' : 'Add to favorites'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Unfavorite an album" isOpen={modal === 'unfavorite'} onClose={closeModal}>
        <form className="stack-form" onSubmit={handleUnfavoriteSubmit}>
          {pickError ? (
            <p className="form-error" role="alert">
              {pickError}
            </p>
          ) : null}
          <label className="field">
            <span>Album</span>
            {unfavoriteOptions.length === 0 ? (
              <p className="muted">No Favorite Albums to remove.</p>
            ) : (
              <select
                value={pickAlbumId}
                onChange={(e) => setPickAlbumId(e.target.value)}
                required
              >
                <option value="">Select an album</option>
                {unfavoriteOptions.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title || 'Untitled'}
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
              disabled={unfavoriteState.loading || unfavoriteOptions.length === 0}
            >
              {unfavoriteState.loading ? 'Saving…' : 'Remove from favorites'}
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
