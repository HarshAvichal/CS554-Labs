export default function Home() {
  return (
    <article className="page prose">
      <h1>Music Library</h1>
      <p>
        <strong>Purpose:</strong> Browse and manage artists, albums, and listeners for the music
        library. The app is built with React and React Router, uses Apollo Client to call the Lab 3
        GraphQL API, and presents data in tables, detail pages, and modals instead of raw JSON.
      </p>
      <p>
        Use <strong>Artists</strong>, <strong>Albums</strong>, and <strong>Listeners</strong> in the
        header to explore lists and individual records, apply filters where available, and use the
        on-screen actions to add, edit, or remove entries. Invalid input is reported using the same
        rules as the GraphQL server.
      </p>
    </article>
  );
}
