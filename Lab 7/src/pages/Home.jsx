export default function Home() {
  return (
    <article className="page prose">
      <h1>Music Library</h1>
      <p>
        This app is the front end for a small music catalog: artists, their
        albums, and listeners who can favorite releases. It talks to the CS
        554 GraphQL API (Lab 3) through Apollo Client so lists, detail pages,
        filters, and edits stay in sync with the server.
      </p>
      <p>
        Use the navigation to browse <strong>Artists</strong>,{' '}
        <strong>Albums</strong>, and <strong>Listeners</strong>, open a record
        for full detail, and manage data with the forms provided on each
        section.
      </p>
    </article>
  );
}
