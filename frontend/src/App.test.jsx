import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  it('renders the dashboard title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { name: /team pulse/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
  });

  it('navigates to Tasks & Projects', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    const tasksLink = screen.getByRole('link', { name: /tasks & projects/i });
    fireEvent.click(tasksLink);
    
    expect(screen.getByText(/Manage and track your team's initiatives/i)).toBeInTheDocument();
  });

  it('renders the navigation menu', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
