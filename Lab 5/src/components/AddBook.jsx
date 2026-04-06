import { useState } from 'react';

function AddBook({ addBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [due, setDue] = useState('');
  const [errors, setErrors] = useState({});

  const getTodayString = () => {
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let validationErrors = {};
    let trimmedTitle = title.trim();
    let trimmedAuthor = author.trim();

    if (!trimmedTitle || trimmedTitle.length < 2) {
      validationErrors.title = 'Title must be at least 2 characters long.';
    } else if (trimmedTitle.length > 255) {
      validationErrors.title = 'Title cannot be longer than 255 characters.';
    }

    if (!trimmedAuthor || trimmedAuthor.length < 5) {
      validationErrors.author = 'Author must be at least 5 characters long.';
    } else if (trimmedAuthor.length > 255) {
      validationErrors.author = 'Author cannot be longer than 255 characters.';
    }

    if (!due) {
      validationErrors.due = 'Please select a valid due date.';
    } else {
      let selectedDate = new Date(due + 'T00:00:00');
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        validationErrors.due = 'Due date cannot be before today.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let [yyyy, mm, dd] = due.split('-');
    let formattedDue = `${parseInt(mm)}/${parseInt(dd)}/${yyyy}`;

    addBook(trimmedTitle, trimmedAuthor, formattedDue);
    setTitle('');
    setAuthor('');
    setDue('');
    setErrors({});
  };

  return (
    <div className="add-book-form">
      <h2>Add a Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
          />
          {errors.title && <p className="error">{errors.title}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
          />
          {errors.author && <p className="error">{errors.author}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="due">Due Date:</label>
          <input
            type="date"
            id="due"
            value={due}
            min={getTodayString()}
            onChange={(e) => setDue(e.target.value)}
          />
          {errors.due && <p className="error">{errors.due}</p>}
        </div>
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default AddBook;
