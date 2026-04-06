import { useState } from 'react';

const empty = {
  title: '',
  genre: '',
  track_count: '',
  artistId: '',
  release_date: '',
  promo_start: '',
  promo_end: '',
};

function initialValues(mode, initial) {
  if (mode === 'edit' && initial) {
    return {
      title: initial.title ?? '',
      genre: initial.genre ?? '',
      track_count:
        initial.track_count != null && initial.track_count !== ''
          ? String(initial.track_count)
          : '',
      artistId: initial.artist?._id ?? '',
      release_date: initial.release_date ?? '',
      promo_start: initial.promo_start ?? '',
      promo_end: initial.promo_end ?? '',
    };
  }
  return { ...empty };
}

export default function AlbumForm({
  mode,
  initial,
  artists,
  artistsLoading,
  submitting,
  errorText,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => initialValues(mode, initial));

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const track = parseInt(values.track_count, 10);
    onSubmit({
      ...values,
      track_count: Number.isFinite(track) ? track : NaN,
    });
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      {errorText ? (
        <p className="form-error" role="alert">
          {errorText}
        </p>
      ) : null}
      <label className="field">
        <span>Title</span>
        <input value={values.title} onChange={set('title')} required />
      </label>
      <label className="field">
        <span>Genre</span>
        <input value={values.genre} onChange={set('genre')} required />
      </label>
      <label className="field">
        <span>Track count</span>
        <input
          type="number"
          min={1}
          max={200}
          step={1}
          value={values.track_count}
          onChange={set('track_count')}
          required
        />
      </label>
      <label className="field">
        <span>Artist</span>
        {artistsLoading ? (
          <p className="muted">Loading artists…</p>
        ) : (
          <select
            value={values.artistId}
            onChange={set('artistId')}
            required={mode === 'add'}
          >
            <option value="">{mode === 'add' ? 'Select an artist' : 'Keep current artist assignment'}</option>
            {artists?.map((a) => (
              <option key={a._id} value={a._id}>
                {a.stage_name || a._id}
              </option>
            ))}
          </select>
        )}
      </label>
      {mode === 'edit' ? (
        <p className="muted form-hint">
          Leave &ldquo;Artist&rdquo; on the first option to leave the album&rsquo;s artist unchanged (including when no
          artist is assigned).
        </p>
      ) : null}
      <label className="field">
        <span>Release date</span>
        <input
          value={values.release_date}
          onChange={set('release_date')}
          placeholder="MM/DD/YYYY"
          required
        />
      </label>
      <label className="field">
        <span>Promo start</span>
        <input
          value={values.promo_start}
          onChange={set('promo_start')}
          placeholder="MM/DD/YYYY"
          required
        />
      </label>
      <label className="field">
        <span>Promo end</span>
        <input
          value={values.promo_end}
          onChange={set('promo_end')}
          placeholder="MM/DD/YYYY"
          required
        />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting || artistsLoading || (mode === 'add' && !values.artistId)}
        >
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add album'}
        </button>
      </div>
    </form>
  );
}
