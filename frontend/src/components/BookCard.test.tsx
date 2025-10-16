import { render, screen } from '@testing-library/react';
import { BookCard } from './BookCard';
import '@testing-library/jest-dom';

const mockBook = {
  title: 'Test Book',
  author: 'Test Author',
  cover_url: '', // or a valid image URL
  rating: 4.5,
  hardcover_url: 'https://hardcover.example.com/test-book',
  reason: 'Recommended for fans of mystery and suspense.',
};

describe('BookCard', () => {
  it('renders the book title and author', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
  });

  it('renders the recommendation reason', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(mockBook.reason)).toBeInTheDocument();
  });

  it('renders the rating', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(mockBook.rating.toFixed(1))).toBeInTheDocument();
  });
});

