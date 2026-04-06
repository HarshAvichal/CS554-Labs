import { Link } from 'react-router-dom';

function Pagination({ currentPage, totalPages, basePath }) {
  return (
    <div className="pagination">
      {currentPage > 1 && (
        <Link to={`${basePath}/${currentPage - 1}`} className="page-btn">
          Previous Page
        </Link>
      )}
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link to={`${basePath}/${currentPage + 1}`} className="page-btn">
          Next Page
        </Link>
      )}
    </div>
  );
}

export default Pagination;
