import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  LISTENERS_QUERY,
  GET_LISTENERS_BY_SUBSCRIPTION,
  SEARCH_LISTENERS_BY_LAST_NAME,
  ADD_LISTENER,
  EDIT_LISTENER,
  REMOVE_LISTENER,
} from '../graphql/listeners.js';
import { formatGraphQLError } from '../utils/graphqlErrors.js';
import {
  afterEntityDeletedMutationOpts,
  defaultMutationOpts,
} from '../apollo/mutationOptions.js';
import Modal from '../components/Modal.jsx';
import ListenerForm from '../components/ListenerForm.jsx';

function fullName(L) {
  return [L.first_name, L.last_name].filter(Boolean).join(' ') || 'Listener';
}

export default function Listeners() {
  const [view, setView] = useState({ type: 'all' });

  const [tierDraft, setTierDraft] = useState('FREE');
  const [lastNameDraft, setLastNameDraft] = useState('');
  const [filterHint, setFilterHint] = useState(null);

  const [modal, setModal] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formError, setFormError] = useState('');

  const qAll = useQuery(LISTENERS_QUERY, { skip: view.type !== 'all' });
  const qTier = useQuery(GET_LISTENERS_BY_SUBSCRIPTION, {
    skip: view.type !== 'tier',
    variables: { tier: view.tier ?? 'FREE' },
  });
  const qSearch = useQuery(SEARCH_LISTENERS_BY_LAST_NAME, {
    skip: view.type !== 'search',
    variables: { searchTerm: view.searchTerm ?? '' },
  });

  const [addListener, addState] = useMutation(ADD_LISTENER, defaultMutationOpts);
  const [editListener, editState] = useMutation(EDIT_LISTENER, defaultMutationOpts);
  const [removeListener, removeState] = useMutation(
    REMOVE_LISTENER,
    afterEntityDeletedMutationOpts
  );

  const { rows, loading, listError } = useMemo(() => {
    if (view.type === 'all') {
      return {
        rows: qAll.data?.listeners ?? [],
        loading: qAll.loading,
        listError: qAll.error,
      };
    }
    if (view.type === 'tier') {
      return {
        rows: qTier.data?.getListenersBySubscription ?? [],
        loading: qTier.loading,
        listError: qTier.error,
      };
    }
    return {
      rows: qSearch.data?.searchListenersByLastName ?? [],
      loading: qSearch.loading,
      listError: qSearch.error,
    };
  }, [view, qAll, qTier, qSearch]);

  const applyTierFilter = (e) => {
    e.preventDefault();
    setFilterHint(null);
    setView({ type: 'tier', tier: tierDraft.toUpperCase() });
  };

  const applyLastNameSearch = (e) => {
    e.preventDefault();
    setFilterHint(null);
    const term = lastNameDraft.trim();
    if (!term) {
      setFilterHint('Enter a last name (or part of it) to search.');
      return;
    }
    setView({ type: 'search', searchTerm: term });
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

  const openEdit = (listener) => {
    setFormError('');
    setFormNonce((n) => n + 1);
    setModal({ mode: 'edit', listener });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleAdd = async (values) => {
    setFormError('');
    try {
      await addListener({
        variables: {
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

  const handleEdit = async (values) => {
    if (!modal?.listener?._id) return;
    setFormError('');
    try {
      await editListener({
        variables: {
          _id: modal.listener._id,
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

  const handleDelete = async (listener) => {
    if (!window.confirm(`Remove ${fullName(listener)}?`)) return;
    try {
      await removeListener({ variables: { _id: listener._id } });
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
          <h1 className="page-title">Listeners</h1>
          <p className="muted page-lead">
            Directory of subscribers, with filters by tier or last name, and CRUD against the API.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          Add listener
        </button>
      </header>

      <section className="panel filters-panel" aria-label="Filters">
        <form className="filter-row" onSubmit={applyTierFilter}>
          <label className="field field--inline">
            <span>Subscription</span>
            <select value={tierDraft} onChange={(e) => setTierDraft(e.target.value)}>
              <option value="FREE">FREE</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </label>
          <button type="submit" className="btn btn--secondary">
            Filter by tier
          </button>
        </form>
        <form className="filter-row" onSubmit={applyLastNameSearch}>
          <label className="field field--inline">
            <span>Last name</span>
            <input
              value={lastNameDraft}
              onChange={(e) => setLastNameDraft(e.target.value)}
              placeholder="Search (case-insensitive partial match)"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Search by last name
          </button>
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            Show all listeners
          </button>
        </form>
        {filterHint ? (
          <p className="filter-hint" role="status">
            {filterHint}
          </p>
        ) : null}
      </section>

      {listError ? (
        <p className="banner banner--error" role="alert">
          {formatGraphQLError(listError)}
        </p>
      ) : null}

      {view.type === 'tier' ? (
        <p className="muted list-meta">Showing listeners on tier {view.tier}.</p>
      ) : null}
      {view.type === 'search' ? (
        <p className="muted list-meta">
          Last name matches &ldquo;{view.searchTerm}&rdquo;.
        </p>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      {!loading && !listError && rows.length === 0 ? (
        <p className="muted">No listeners match this view.</p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">First name</th>
                <th scope="col">Last name</th>
                <th scope="col">Subscription</th>
                <th scope="col" className="num">
                  Favorite albums
                </th>
                <th scope="col" className="actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((L) => (
                <tr key={L._id}>
                  <td>
                    <Link to={`/listeners/${L._id}`} className="table-link">
                      {L.first_name || '—'}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/listeners/${L._id}`} className="table-link">
                      {L.last_name || '—'}
                    </Link>
                  </td>
                  <td>{L.subscription_tier || '—'}</td>
                  <td className="num">{L.numOfFavoriteAlbums ?? '—'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => openEdit(L)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(L)}
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
        title={modal?.mode === 'edit' ? 'Edit listener' : 'Add listener'}
        isOpen={!!modal}
        onClose={closeModal}
      >
        <ListenerForm
          key={formNonce}
          mode={modal?.mode === 'edit' ? 'edit' : 'add'}
          initial={modal?.listener}
          submitting={addState.loading || editState.loading}
          errorText={formError}
          onSubmit={modal?.mode === 'edit' ? handleEdit : handleAdd}
          onCancel={closeModal}
        />
      </Modal>
    </article>
  );
}
