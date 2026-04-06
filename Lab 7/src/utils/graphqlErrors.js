export function formatGraphQLError(error) {
  if (!error) return 'Something went wrong.';
  const first = error.graphQLErrors?.[0];
  if (first?.message) return first.message;
  if (error.networkError) {
    const msg = error.networkError.message || 'Network error';
    return `Could not reach the server (${msg}). Is Lab 3 running on port 4000?`;
  }
  return error.message || 'Something went wrong.';
}
