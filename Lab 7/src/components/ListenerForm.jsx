import { useState } from 'react';

const empty = {
  first_name: '',
  last_name: '',
  email: '',
  date_of_birth: '',
  subscription_tier: 'FREE',
};

function initialValues(mode, initial) {
  if (mode === 'edit' && initial) {
    const tier = (initial.subscription_tier ?? 'FREE').toUpperCase();
    return {
      first_name: initial.first_name ?? '',
      last_name: initial.last_name ?? '',
      email: initial.email ?? '',
      date_of_birth: initial.date_of_birth ?? '',
      subscription_tier: tier === 'PREMIUM' ? 'PREMIUM' : 'FREE',
    };
  }
  return { ...empty };
}

export default function ListenerForm({
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
        <span>First name</span>
        <input value={values.first_name} onChange={set('first_name')} required />
      </label>
      <label className="field">
        <span>Last name</span>
        <input value={values.last_name} onChange={set('last_name')} required />
      </label>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="off"
          value={values.email}
          onChange={set('email')}
          required
        />
      </label>
      <label className="field">
        <span>Date of birth</span>
        <input
          value={values.date_of_birth}
          onChange={set('date_of_birth')}
          placeholder="MM/DD/YYYY"
          required
        />
      </label>
      <label className="field">
        <span>Subscription tier</span>
        <select value={values.subscription_tier} onChange={set('subscription_tier')} required>
          <option value="FREE">FREE</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
      </label>
      <p className="muted form-hint">
        Age must be between 13 and 120 (computed from date of birth on the server).
      </p>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add listener'}
        </button>
      </div>
    </form>
  );
}
