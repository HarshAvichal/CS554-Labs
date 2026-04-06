import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ARTISTS_QUERY,
  GET_ARTISTS_BY_LABEL,
  GET_ARTISTS_SIGNED_BETWEEN,
  ADD_ARTIST,
  EDIT_ARTIST,
  REMOVE_ARTIST,
} from '../graphql/artists.js';
import { DEFAULT_PERIOD_START } from '../constants/dates.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import Modal from '../components/Modal.jsx';
import ArtistForm from '../components/ArtistForm.jsx';

export default function Artists() {
  const [view, setView] = useState({ type: 'all' });

  const [labelDraft, setLabelDraft] = useState('');
  const [signedStartDraft, setSignedStartDraft] = useState('');
  const [signedEndDraft, setSignedEndDraft] = useState('');
  const [filterHint, setFilterHint] = useState(null);

  const [modal, setModal] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');

  const qAll = useQuery(ARTISTS_QUERY, { skip: view.type !== 'all' });
  const qLabel = useQuery(GET_ARTISTS_BY_LABEL, {
    skip: view.type !== 'label',
    variables: { label: view.label ?? '' },
  });
  const qSigned = useQuery(GET_ARTISTS_SIGNED_BETWEEN, {
    skip: view.type !== 'signed',
    variables: { start: view.start ?? '', end: view.end ?? '' },
  });

  const mutationOpts = {
    awaitRefetchQueries: true,
    refetchQueries: 'active',
  };

  const [addArtist, addState] = useMutation(ADD_ARTIST, mutationOpts);
  const [editArtist, editState] = useMutation(EDIT_ARTIST, mutationOpts);
  const [removeArtist, removeState] = useMutation(REMOVE_ARTIST, mutationOpts);

  const { rows, loading, listError } = useMemo(() => {
    if (view.type === 'all') {
      return {
        rows: qAll.data?.artists ?? [],
        loading: qAll.loading,
        listError: qAll.error,
      };
    }
    if (view.type === 'label') {
      return {
        rows: qLabel.data?.getArtistsByLabel ?? [],
        loading: qLabel.loading,
        listError: qLabel.error,
      };
    }
    return {
      rows: qSigned.data?.getArtistsSignedBetween ?? [],
      loading: qSigned.loading,
      listError: qSigned.error,
    };
  }, [view, qAll, qLabel, qSigned]);

  const applyLabelFilter = (e) => {
    e.preventDefault();
    setFilterHint(null);
    const label = labelDraft.trim();
    if (!label) {
      setFilterHint('Enter a label to filter by.');
      return;
    }
    setView({ type: 'label', label });
  };

  const applySignedFilter = (e) => {
    e.preventDefault();
    setFilterHint(null);
    const end = signedEndDraft.trim();
    if (!end) {
      setFilterHint('End date is required for the signing period filter.');
      return;
    }
    const start = signedStartDraft.trim() || DEFAULT_PERIOD_START;
    setView({ type: 'signed', start, end });
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

  const openEdit = (artist) => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal({ mode: 'edit', artist });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleAdd = async (values) => {
    setFormError('');
    try {
      await addArtist({
        variables: {
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

  const handleEdit = async (values) => {
    if (!modal?.artist?._id) return;
    setFormError('');
    try {
      await editArtist({
        variables: {
          _id: modal.artist._id,
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

  const handleDelete = async (artist) => {
    if (!window.confirm(`Remove ${artist.stage_name || 'this artist'}?`)) return;
    try {
      await removeArtist({ variables: { _id: artist._id } });
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
          <h1 className="page-title">Artists</h1>
          <p className="muted page-lead">
            Browse roster, filter by label or signing window, and keep records in sync with the
            API.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          Add artist
        </button>
      </header>

      <section className="panel filters-panel" aria-label="Filters">
        <form className="filter-row" onSubmit={applyLabelFilter}>
          <label className="field field--inline">
            <span>Label</span>
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              placeholder="Exact label (case-insensitive)"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Filter by label
          </button>
        </form>
        <form className="filter-row filter-row--dates" onSubmit={applySignedFilter}>
          <label className="field field--inline">
            <span>Signed from</span>
            <input
              value={signedStartDraft}
              onChange={(e) => setSignedStartDraft(e.target.value)}
              placeholder={`blank → ${DEFAULT_PERIOD_START}`}
            />
          </label>
          <label className="field field--inline">
            <span>Signed through</span>
            <input
              value={signedEndDraft}
              onChange={(e) => setSignedEndDraft(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Filter by signing period
          </button>
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            Show all artists
          </button>
        </form>
        {filterHint ? (
          <p className="filter-hint" role="status">
            {filterHint}
          </p>
        ) : null}
        <p className="muted filter-caption">
          Dates must be <strong>MM/DD/YYYY</strong>. If &ldquo;Signed from&rdquo; is empty, the
          range starts at <strong>{DEFAULT_PERIOD_START}</strong>.
        </p>
      </section>

      {listError ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(listError)}
        </p>
      ) : null}

      {view.type === 'label' ? (
        <p className="muted list-meta">Showing artists on label &ldquo;{view.label}&rdquo;.</p>
      ) : null}
      {view.type === 'signed' ? (
        <p className="muted list-meta">
          Signed between {view.start} and {view.end}.
        </p>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      {!loading && !listError && rows.length === 0 ? (
        <p className="muted">No artists match this view.</p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Stage name</th>
                <th scope="col">Genre</th>
                <th scope="col">Label</th>
                <th scope="col" className="num">
                  Albums
                </th>
                <th scope="col" className="actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id}>
                  <td>
                    <Link to={`/artists/${a._id}`} className="table-link">
                      {a.stage_name || '—'}
                    </Link>
                  </td>
                  <td>{a.genre || '—'}</td>
                  <td>{a.label || '—'}</td>
                  <td className="num">{a.numOfAlbums ?? '—'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => openEdit(a)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(a)}
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
        title={modal?.mode === 'edit' ? 'Edit artist' : 'Add artist'}
        isOpen={!!modal}
        onClose={closeModal}
      >
        <ArtistForm
          key={formNonce}
          mode={modal?.mode === 'edit' ? 'edit' : 'add'}
          initial={modal?.artist}
          submitting={addState.loading || editState.loading}
          errorText={formError}
          onSubmit={modal?.mode === 'edit' ? handleEdit : handleAdd}
          onCancel={closeModal}
        />
      </Modal>
    </article>
  );
}
