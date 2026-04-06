import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ALBUMS_QUERY,
  GET_ALBUMS_BY_GENRE,
  GET_ALBUMS_BY_PROMO_DATE_RANGE,
  ADD_ALBUM,
  EDIT_ALBUM,
  REMOVE_ALBUM,
} from '../graphql/albums.js';
import { ARTISTS_QUERY } from '../graphql/artists.js';
import { DEFAULT_PERIOD_START } from '../constants/dates.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import Modal from '../components/Modal.jsx';
import AlbumForm from '../components/AlbumForm.jsx';

function artistLabel(album) {
  if (album?.artist?.stage_name) return album.artist.stage_name;
  if (album?.artist?._id) return album.artist._id;
  return 'No Artist Assigned';
}

export default function Albums() {
  const [view, setView] = useState({ type: 'all' });

  const [genreDraft, setGenreDraft] = useState('');
  const [promoStartDraft, setPromoStartDraft] = useState('');
  const [promoEndDraft, setPromoEndDraft] = useState('');
  const [filterHint, setFilterHint] = useState(null);

  const [modal, setModal] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');

  const qAll = useQuery(ALBUMS_QUERY, { skip: view.type !== 'all' });
  const qGenre = useQuery(GET_ALBUMS_BY_GENRE, {
    skip: view.type !== 'genre',
    variables: { genre: view.genre ?? '' },
  });
  const qPromo = useQuery(GET_ALBUMS_BY_PROMO_DATE_RANGE, {
    skip: view.type !== 'promo',
    variables: { start: view.start ?? '', end: view.end ?? '' },
  });

  const artistsQ = useQuery(ARTISTS_QUERY, { skip: !modal });

  const mutationOpts = {
    awaitRefetchQueries: true,
    refetchQueries: 'active',
  };

  const [addAlbum, addState] = useMutation(ADD_ALBUM, mutationOpts);
  const [editAlbum, editState] = useMutation(EDIT_ALBUM, mutationOpts);
  const [removeAlbum, removeState] = useMutation(REMOVE_ALBUM, mutationOpts);

  const { rows, loading, listError } = useMemo(() => {
    if (view.type === 'all') {
      return {
        rows: qAll.data?.albums ?? [],
        loading: qAll.loading,
        listError: qAll.error,
      };
    }
    if (view.type === 'genre') {
      return {
        rows: qGenre.data?.getAlbumsByGenre ?? [],
        loading: qGenre.loading,
        listError: qGenre.error,
      };
    }
    return {
      rows: qPromo.data?.getAlbumsByPromoDateRange ?? [],
      loading: qPromo.loading,
      listError: qPromo.error,
    };
  }, [view, qAll, qGenre, qPromo]);

  const applyGenreFilter = (e) => {
    e.preventDefault();
    setFilterHint(null);
    const genre = genreDraft.trim();
    if (!genre) {
      setFilterHint('Enter a genre to filter by.');
      return;
    }
    setView({ type: 'genre', genre });
  };

  const applyPromoFilter = (e) => {
    e.preventDefault();
    setFilterHint(null);
    const end = promoEndDraft.trim();
    if (!end) {
      setFilterHint('End date is required for the promo range filter.');
      return;
    }
    const start = promoStartDraft.trim() || DEFAULT_PERIOD_START;
    setView({ type: 'promo', start, end });
  };

  const clearFilters = () => {
    setView({ type: 'all' });
    setFilterHint(null);
  };

  const openAdd = () => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal({ mode: 'add' });
  };

  const openEdit = (album) => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal({ mode: 'edit', album });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleAdd = async (values) => {
    setFormError('');
    const artist = values.artistId?.trim();
    if (!artist) {
      setFormError('Select an artist for this album.');
      return;
    }
    try {
      await addAlbum({
        variables: {
          title: values.title.trim(),
          genre: values.genre.trim(),
          track_count: values.track_count,
          artist,
          release_date: values.release_date.trim(),
          promo_start: values.promo_start.trim(),
          promo_end: values.promo_end.trim(),
        },
      });
      closeModal();
    } catch (err) {
      setFormError(formatGraphQLError(err));
    }
  };

  const handleEdit = async (values) => {
    if (!modal?.album?._id) return;
    setFormError('');
    const artistTrim = values.artistId?.trim();
    const variables = {
      _id: modal.album._id,
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

  const handleDelete = async (album) => {
    if (!window.confirm(`Remove ${album.title || 'this album'}?`)) return;
    try {
      await removeAlbum({ variables: { _id: album._id } });
    } catch (err) {
      alert(formatGraphQLError(err));
    }
  };

  const busy =
    loading ||
    addState.loading ||
    editState.loading ||
    removeState.loading;

  return (
    <article className="page page--wide">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="muted page-lead">
            Catalog releases, filter by genre or promo window, and sync changes with the API.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          Add album
        </button>
      </header>

      <section className="panel filters-panel" aria-label="Filters">
        <form className="filter-row" onSubmit={applyGenreFilter}>
          <label className="field field--inline">
            <span>Genre</span>
            <input
              value={genreDraft}
              onChange={(e) => setGenreDraft(e.target.value)}
              placeholder="Exact genre (case-insensitive)"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Filter by genre
          </button>
        </form>
        <form className="filter-row filter-row--dates" onSubmit={applyPromoFilter}>
          <label className="field field--inline">
            <span>Promo range from</span>
            <input
              value={promoStartDraft}
              onChange={(e) => setPromoStartDraft(e.target.value)}
              placeholder={`blank → ${DEFAULT_PERIOD_START}`}
            />
          </label>
          <label className="field field--inline">
            <span>Promo range through</span>
            <input
              value={promoEndDraft}
              onChange={(e) => setPromoEndDraft(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Filter by promo window
          </button>
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            Show all albums
          </button>
        </form>
        {filterHint ? (
          <p className="filter-hint" role="status">
            {filterHint}
          </p>
        ) : null}
        <p className="muted filter-caption">
          Promo filter: albums whose <strong>entire</strong> promo period falls inside the range. Dates use{' '}
          <strong>MM/DD/YYYY</strong>. If &ldquo;Promo range from&rdquo; is empty, the range starts at{' '}
          <strong>{DEFAULT_PERIOD_START}</strong>.
        </p>
      </section>

      {listError ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(listError)}
        </p>
      ) : null}

      {view.type === 'genre' ? (
        <p className="muted list-meta">Showing albums in genre &ldquo;{view.genre}&rdquo;.</p>
      ) : null}
      {view.type === 'promo' ? (
        <p className="muted list-meta">
          Promo window fully inside {view.start} – {view.end}.
        </p>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      {!loading && !listError && rows.length === 0 ? (
        <p className="muted">No albums match this view.</p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Genre</th>
                <th scope="col">Artist</th>
                <th scope="col" className="num">
                  Tracks
                </th>
                <th scope="col" className="actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((album) => (
                <tr key={album._id}>
                  <td>
                    <Link to={`/albums/${album._id}`} className="table-link">
                      {album.title || 'Untitled'}
                    </Link>
                  </td>
                  <td>{album.genre || '—'}</td>
                  <td>{artistLabel(album)}</td>
                  <td className="num">{album.track_count ?? '—'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => openEdit(album)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(album)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        title={modal?.mode === 'edit' ? 'Edit album' : 'Add album'}
        isOpen={!!modal}
        onClose={closeModal}
      >
        <AlbumForm
          key={formNonce}
          mode={modal?.mode === 'edit' ? 'edit' : 'add'}
          initial={modal?.album}
          artists={artistsQ.data?.artists}
          artistsLoading={artistsQ.loading}
          submitting={addState.loading || editState.loading}
          errorText={formError}
          onSubmit={modal?.mode === 'edit' ? handleEdit : handleAdd}
          onCancel={closeModal}
        />
      </Modal>
    </article>
  );
}
