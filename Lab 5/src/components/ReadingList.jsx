function ReadingList({ books, removeBook, toggleFinished }) {
  const isPastDue = (dateStr) => {
    let parts = dateStr.split('/');
    let dueDate = new Date(parts[2], parts[0] - 1, parts[1]);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const unfinishedBooks = books.filter(book => !book.finished);

  if (unfinishedBooks.length === 0) {
    return <p>No more books to read! Nice work!</p>;
  }

  return (
    <div>
      {unfinishedBooks.map(book => {
        let overdue = isPastDue(book.due);
        return (
          <div className="book-card" key={book.id}>
            <h1 className={overdue ? 'past-due' : ''}>{book.title}</h1>
            <p>Author: {book.author}</p>
            <p className={overdue ? 'past-due' : ''}>Finish By: {book.due}</p>
            <p>Finished: No</p>
            <button className="btn-remove" onClick={() => removeBook(book.id)}>Remove</button>
            <button className="btn-finished" onClick={() => toggleFinished(book)}>Mark Finished</button>
          </div>
        );
      })}
    </div>
  );
}

export default ReadingList;
