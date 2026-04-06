export default function Home() {
  return (
    <article className="page prose">
      <h1>Music Library</h1>
      <p>
        <strong>Purpose:</strong> This site is the CS-554 <strong>Lab 7</strong> client for your music
        library. It is a React single-page app that uses <strong>Apollo Client</strong> and{' '}
        <strong>GraphQL</strong> to talk to the Lab 3 API (MongoDB with Redis caching on the server).
        You can browse and maintain artists, albums, and listeners—including who has favorited which
        album—without dumping raw JSON; everything is shown in tables, detail screens, and modals.
      </p>
      <p>
        Use the header links to open <strong>Artists</strong>, <strong>Albums</strong>, or{' '}
        <strong>Listeners</strong>. Each area supports the required filters, links between related
        records, and add / edit / delete actions that honor the same validation rules as the GraphQL
        server.
      </p>
    </article>
  );
}
