import { useState } from 'react';

const empty = {
  stage_name: '',
  genre: '',
  label: '',
  management_email: '',
  management_phone: '',
  home_city: '',
  date_signed: '',
};

function initialValues(mode, initial) {
  if (mode === 'edit' && initial) {
    return {
      stage_name: initial.stage_name ?? '',
      genre: initial.genre ?? '',
      label: initial.label ?? '',
      management_email: initial.management_email ?? '',
      management_phone: initial.management_phone ?? '',
      home_city: initial.home_city ?? '',
      date_signed: initial.date_signed ?? '',
    };
  }
  return { ...empty };
}

export default function ArtistForm({
  mode,
  initial,
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
    onSubmit(values);
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      {errorText ? (
        <p className="form-error" role="alert">
          {errorText}
        </p>
      ) : null}
      <label className="field">
        <span>Stage name</span>
        <input value={values.stage_name} onChange={set('stage_name')} required />
      </label>
      <label className="field">
        <span>Genre</span>
        <input value={values.genre} onChange={set('genre')} required />
      </label>
      <label className="field">
        <span>Label</span>
        <input value={values.label} onChange={set('label')} required />
      </label>
      <label className="field">
        <span>Management email</span>
        <input
          type="email"
          autoComplete="off"
          value={values.management_email}
          onChange={set('management_email')}
          required
        />
      </label>
      <label className="field">
        <span>Management phone</span>
        <input
          value={values.management_phone}
          onChange={set('management_phone')}
          placeholder="###-###-####"
          required
        />
      </label>
      <label className="field">
        <span>Home city</span>
        <input value={values.home_city} onChange={set('home_city')} required />
      </label>
      <label className="field">
        <span>Date signed</span>
        <input
          value={values.date_signed}
          onChange={set('date_signed')}
          placeholder="MM/DD/YYYY"
          required
        />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add artist'}
        </button>
      </div>
    </form>
  );
}
