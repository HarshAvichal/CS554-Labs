import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_ARTIST_BY_ID,
  GET_ALBUMS_BY_ARTIST_ID,
  EDIT_ARTIST,
  REMOVE_ARTIST,
} from '../graphql/artists.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import {
  afterEntityDeletedMutationOpts,
  defaultMutationOpts,
} from '../apollo/mutationOptions.js';
import Modal from '../components/Modal.jsx';
import ArtistForm from '../components/ArtistForm.jsx';

function AlbumList({ albums }) {
  if (!albums?.length) {
    return <p className="muted">No albums in this list.</p>;
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

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');

  const [editArtist, editState] = useMutation(EDIT_ARTIST, defaultMutationOpts);
  const [removeArtist, removeState] = useMutation(
    REMOVE_ARTIST,
    afterEntityDeletedMutationOpts
  );

  const artistQ = useQuery(GET_ARTIST_BY_ID, {
    variables: { _id: id },
    skip: !id,
  });

  const albumsQ = useQuery(GET_ALBUMS_BY_ARTIST_ID, {
    variables: { artistId: id },
    skip: !id,
  });

  const artist = artistQ.data?.getArtistById;
  const fromField = artist?.albums ?? [];
  const fromQuery = albumsQ.data?.getAlbumsByArtistId ?? [];

  const openEdit = () => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const handleEdit = async (values) => {
    if (!artist?._id) return;
    setFormError('');
    try {
      await editArtist({
        variables: {
          _id: artist._id,
          stage_name: values.stage_name.trim(),
          genre: values.genre.trim(),
          label: values.label.trim(),
          management_email: values.management_email.trim(),
          management_phone: values.management_phone.trim(),
          home_city: values.home_city.trim(),
          date_signed: values.date_signed.trim(),
        },
      });
      closeModal();
    } catch (err) {
      setFormError(formatGraphQLError(err));
    }
  };

  const handleDelete = async () => {
    if (!artist?._id) return;
    if (!window.confirm(`Remove ${artist.stage_name || 'this artist'}?`)) return;
    try {
      await removeArtist({ variables: { _id: artist._id } });
      navigate('/artists');
    } catch (err) {
      alert(formatGraphQLError(err));
    }
  };

  const busy = editState.loading || removeState.loading;

  return (
    <article className="page page--wide">
      <p className="back-row">
        <Link to="/artists" className="text-back">
          ← Artists
        </Link>
      </p>

      {artistQ.error ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(artistQ.error)}
        </p>
      ) : null}

      {artistQ.loading && !artist ? <p className="muted">Loading…</p> : null}

      {!artistQ.loading && !artistQ.error && !artist ? (
        <p className="muted">No artist data.</p>
      ) : null}

      {artist ? (
        <>
          <header className="page-toolbar detail-toolbar">
            <div>
              <h1 className="page-title">{artist.stage_name || 'Artist'}</h1>
              <p className="muted page-lead">
                {artist.genre || '—'} · {artist.label || '—'}
              </p>
            </div>
            <div className="detail-actions">
              <button type="button" className="btn btn--ghost" onClick={openEdit} disabled={busy}>
                Edit
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
                <dt>Stage name</dt>
                <dd>{artist.stage_name || '—'}</dd>
              </div>
              <div>
                <dt>Genre</dt>
                <dd>{artist.genre || '—'}</dd>
              </div>
              <div>
                <dt>Label</dt>
                <dd>{artist.label || '—'}</dd>
              </div>
              <div>
                <dt>Management email</dt>
                <dd>{artist.management_email || '—'}</dd>
              </div>
              <div>
                <dt>Management phone</dt>
                <dd>{artist.management_phone || '—'}</dd>
              </div>
              <div>
                <dt>Home city</dt>
                <dd>{artist.home_city || '—'}</dd>
              </div>
              <div>
                <dt>Date signed</dt>
                <dd>{artist.date_signed || '—'}</dd>
              </div>
              <div>
                <dt>
                  numOfAlbums <span className="computed-tag">computed</span>
                </dt>
                <dd>
                  <strong>{artist.numOfAlbums ?? '—'}</strong>
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Albums from the Artist type</h2>
            <p className="muted subsection-lead">
              Relationship field <code>albums</code> on <code>Artist</code>.
            </p>
            <AlbumList albums={fromField} />
          </section>

          <section className="panel detail-panel">
            <h2 className="subsection-title">Albums from getAlbumsByArtistId</h2>
            <p className="muted subsection-lead">Separate query required by the lab.</p>
            {albumsQ.error ? (
              <p className="form-error" role="alert">
                {formatGraphQLError(albumsQ.error)}
              </p>
            ) : albumsQ.loading && fromQuery.length === 0 ? (
              <p className="muted">Loading…</p>
            ) : (
              <AlbumList albums={fromQuery} />
            )}
          </section>
        </>
      ) : null}

      <Modal title="Edit artist" isOpen={modalOpen} onClose={closeModal}>
        <ArtistForm
          key={formNonce}
          mode="edit"
          initial={artist}
          submitting={editState.loading}
          errorText={formError}
          onSubmit={handleEdit}
          onCancel={closeModal}
        />
      </Modal>
    </article>
  );
}
