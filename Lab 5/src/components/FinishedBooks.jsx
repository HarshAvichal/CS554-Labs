function FinishedBooks({ books, toggleFinished }) {
  const finishedBooks = books.filter(book => book.finished);

  if (finishedBooks.length === 0) {
    return <p>No finished books yet. Keep reading!</p>;
  }

  return (
    <div>
      {finishedBooks.map(book => (
        <div className="book-card" key={book.id}>
          <h1>{book.title}</h1>
          <p>Author: {book.author}</p>
          <p>Finish By: {book.due}</p>
          <p>Finished: Yes</p>
          <button className="btn-unfinished" onClick={() => toggleFinished(book)}>Mark Unfinished</button>
        </div>
      ))}
    </div>
  );
}

export default FinishedBooks;
