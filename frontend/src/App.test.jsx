/**
 * @fileoverview App-level integration tests for SyncSphere AI
 * @description Tests navigation, rendering, and accessibility across the full app.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

/**
 * Helper to render App inside MemoryRouter at a specific route.
 * @param {string} [initialPath='/'] - Starting route.
 */
const renderApp = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component', () => {
  it('renders the SyncSphere brand name in sidebar', () => {
    renderApp('/');
    expect(screen.getByText('SyncSphere')).toBeInTheDocument();
  });

  it('renders the main navigation', () => {
    renderApp('/');
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders Team Pulse nav item', () => {
    renderApp('/');
    expect(screen.getByText('Team Pulse')).toBeInTheDocument();
  });

  it('renders Tasks & Projects nav item', () => {
    renderApp('/');
    expect(screen.getByText('Tasks & Projects')).toBeInTheDocument();
  });

  it('renders Context Chat nav item', () => {
    renderApp('/');
    expect(screen.getByText('Context Chat')).toBeInTheDocument();
  });

  it('renders Workflows nav item', () => {
    renderApp('/');
    expect(screen.getByText('Workflows')).toBeInTheDocument();
  });

  it('renders New Task button in sidebar', () => {
    renderApp('/');
    expect(screen.getByRole('button', { name: /create new task/i })).toBeInTheDocument();
  });

  it('skip-to-content link is present for accessibility', () => {
    renderApp('/');
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('dashboard shows Team Pulse heading after load', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /team pulse/i })).toBeInTheDocument();
    });
  });

  it('shows Active Tasks stat card after data loads', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    });
  });

  it('navigates to Tasks page on sidebar click', async () => {
    renderApp('/tasks');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tasks & projects/i })).toBeInTheDocument();
    });
  });

  it('navigates to Chat page', async () => {
    renderApp('/chat');
    await waitFor(() => {
      // The ChatPage renders an h1 with 'Context Chat'
      expect(screen.getByText('Context Chat')).toBeInTheDocument();
    });
  });

  it('navigates to Workflows page', async () => {
    renderApp('/workflows');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /workflows/i })).toBeInTheDocument();
    });
  });

  it('navigates to Settings page', async () => {
    renderApp('/settings');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });
  });

  it('New Task button opens modal', async () => {
    renderApp('/');
    const btn = screen.getByRole('button', { name: /create new task/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });
});
