import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the dashboard title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /team pulse/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<App />);
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/blocked items/i)).toBeInTheDocument();
    expect(screen.getByText(/team velocity/i)).toBeInTheDocument();
  });

  it('renders the navigation menu', () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders the AI Work Coordinator section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /ai work coordinator/i })).toBeInTheDocument();
  });
});
