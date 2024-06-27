import React, { useReducer, useEffect, useState, useRef } from 'react';
import './App.scss';
import { getBooks, createBook, updateBook, deleteBook } from './api/api';
import { HashLoader } from 'react-spinners';

//Book interface
interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
}

//Initial state
const initialBooks: Book[] = [];

//Reducer function
type ActionType =
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'LOAD_BOOKS'; payload: Book[] };

function bookReducer(state: Book[], action: ActionType): Book[] {
  switch (action.type) {
    case 'ADD_BOOK':
      return [...state, action.payload];
    case 'UPDATE_BOOK':
      return state.map(book => book.id === action.payload.id ? action.payload : book);
    case 'DELETE_BOOK':
      return state.filter(book => book.id !== action.payload);
    case 'LOAD_BOOKS':
      return action.payload;
    default:
      return state;
  }
}

//BookForm component
const BookForm = ({
  addBook,
  editBook,
  editingBook,
}: {
  addBook: (book: Book) => void;
  editBook: (book: Book) => void;
  editingBook: Book | null;
}) => {
  const idRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingBook) {
      idRef.current!.value = editingBook.id;
      titleRef.current!.value = editingBook.title;
      authorRef.current!.value = editingBook.author;
      yearRef.current!.value = editingBook.year.toString();
    }
  }, [editingBook]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newBook: Book = {
      id: idRef.current?.value.toUpperCase() || '',
      title: titleRef.current?.value || '',
      author: authorRef.current?.value || '',
      year: parseInt(yearRef.current?.value || '0', 10),
    };

    //Validate ID format
    if (!/^[A-Za-z]{2}\d{2}$/.test(newBook.id)) {
      alert('ID must be in the format XX00 (e.g., ED01).');
      return;
    }

    //Validate other fields
    if (!newBook.title || !newBook.author || !newBook.year) {
      alert('Please fill out all fields.');
      return;
    }

    if (editingBook) {
      editBook(newBook);
    } else {
      addBook(newBook);
    }

    //Clear inputs
    idRef.current!.value = '';
    titleRef.current!.value = '';
    authorRef.current!.value = '';
    yearRef.current!.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <div className="input-container">
        <input
          type="text"
          placeholder="ID (e.g., ED01)"
          ref={idRef}
          required
          pattern="[A-Za-z]{2}\d{2}"
          title="ID must be in format ED01"
        />
        <input type="text" placeholder="Title" ref={titleRef} required />
        <input type="text" placeholder="Author" ref={authorRef} required />
        <input type="number" placeholder="Year" ref={yearRef} required />
      </div>
      <button type="submit">{editingBook ? 'Update Book' : 'Add Book'}</button>
    </form>
  );
};

//BookTable component
interface BookTableProps {
  books: Book[];
  editBook: (book: Book) => void;
  deleteBook: (id: string) => void;
}

const BookTable = ({ books, editBook, deleteBook }: BookTableProps) => {
  return (
    <table className="book-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map(book => (
          <tr key={book.id}>
            <td>{book.id}</td>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.year}</td>
            <td>
              <button onClick={() => editBook(book)}>Edit</button>
              <button onClick={() => deleteBook(book.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

//Pagination component
interface PaginationProps {
  booksPerPage: number;
  totalBooks: number;
  paginate: (pageNumber: number) => void;
}

const Pagination = ({ booksPerPage, totalBooks, paginate }: PaginationProps) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalBooks / booksPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className="page-item">
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// SearchBar component
const SearchBar = ({ setSearchTerm }: { setSearchTerm: (term: string) => void }) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    setSearchTerm(input);
  }, [input, setSearchTerm]);

  return (
    <input
      type="text"
      placeholder="Search by title"
      value={input}
      onChange={e => setInput(e.target.value)}
      className="search-bar"
    />
  );
};

//Main App component
const App = () => {
  const [books, dispatch] = useReducer(bookReducer, initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true); 

  const booksPerPage = 5;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true); 
        const books = await getBooks();
        dispatch({ type: 'LOAD_BOOKS', payload: books });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); 
      }
    };
    fetchBooks();
  }, []);

  const addBook = async (book: Book) => {
    try {
      const newBook = await createBook(book);
      dispatch({ type: 'ADD_BOOK', payload: newBook });
    } catch (error) {
      console.error(error);
    }
  };

  const updateBookDetails = async (book: Book) => {
    try {
      const updatedBook = await updateBook(book.id, book);
      dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBookById = async (id: string) => {
    try {
      await deleteBook(id);
      dispatch({ type: 'DELETE_BOOK', payload: id });
    } catch (error) {
      console.error(error);
    }
  };

  const editBook = (book: Book) => {
    setEditingBook(book);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const filteredBooks = currentBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="App">
        <h1>Book Repository</h1>
        <SearchBar setSearchTerm={setSearchTerm} />
        <BookForm addBook={addBook} editBook={updateBookDetails} editingBook={editingBook} />
        {loading ? ( 
          <HashLoader />
        ) : (
          <>
            <BookTable books={filteredBooks} editBook={editBook} deleteBook={deleteBookById} />
            <Pagination booksPerPage={booksPerPage} totalBooks={books.length} paginate={paginate} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
