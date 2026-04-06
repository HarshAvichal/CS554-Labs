import { useState } from 'react';
import ReadingList from './components/ReadingList';
import FinishedBooks from './components/FinishedBooks';
import AddBook from './components/AddBook';
import './App.css';

function App() {
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt & David Thomas',
      due: '3/15/2023',
      finished: false
    },
    {
      id: 2,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      due: '5/20/2024',
      finished: false
    },
    {
      id: 3,
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      due: '12/10/2026',
      finished: false
    },
    {
      id: 4,
      title: 'Design Patterns',
      author: 'Erich Gamma',
      due: '2/28/2025',
      finished: false
    },
    {
      id: 5,
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      due: '7/10/2026',
      finished: false
    },
    {
      id: 6,
      title: "You Don't Know JS",
      author: 'Kyle Simpson',
      due: '8/15/2026',
      finished: false
    },
    {
      id: 7,
      title: 'Eloquent JavaScript',
      author: 'Marijn Haverbeke',
      due: '1/10/2025',
      finished: false
    },
    {
      id: 8,
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      due: '11/30/2026',
      finished: false
    },
    {
      id: 9,
      title: 'Code Complete',
      author: 'Steve McConnell',
      due: '4/1/2026',
      finished: false
    },
    {
      id: 10,
      title: 'Cracking the Coding Interview',
      author: 'Gayle Laakmann McDowell',
      due: '6/15/2026',
      finished: false
    }
  ]);

  const removeBook = (id) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
  };

  const toggleFinished = (book) => {
    setBooks(prevBooks =>
      prevBooks.map(b => {
        if (b.id === book.id) {
          return { ...b, finished: !b.finished };
        }
        return b;
      })
    );
  };

  const addBook = (title, author, due) => {
    setBooks(prevBooks => {
      let nextId = prevBooks.length > 0
        ? Math.max(...prevBooks.map(b => b.id)) + 1
        : 1;
      let newBook = {
        id: nextId,
        title: title.trim(),
        author: author.trim(),
        due: due,
        finished: false
      };
      return [...prevBooks, newBook];
    });
  };

  return (
    <div className="App">
      <h1>My Reading List</h1>
      <AddBook addBook={addBook} />
      <div className="book-sections">
        <div className="section">
          <h2>Reading List</h2>
          <ReadingList
            books={books}
            removeBook={removeBook}
            toggleFinished={toggleFinished}
          />
        </div>
        <div className="section">
          <h2>Finished Books</h2>
          <FinishedBooks
            books={books}
            toggleFinished={toggleFinished}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
