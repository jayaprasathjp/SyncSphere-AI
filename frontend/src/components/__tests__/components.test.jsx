/**
 * @fileoverview Frontend component tests for SyncSphere AI
 * @description Tests for StatCard and TaskItem components using Vitest + React Testing Library.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// ─── Mock lucide-react icons ──────────────────────────────────────────────────
vi.mock('lucide-react', () => ({
  CheckSquare: () => <svg data-testid="icon-check" />,
  AlertCircle: () => <svg data-testid="icon-alert" />,
  TrendingUp: () => <svg data-testid="icon-trending" />,
  Users: () => <svg data-testid="icon-users" />,
  Activity: () => <svg data-testid="icon-activity" />,
  Sparkles: () => <svg data-testid="icon-sparkles" />,
  ArrowUpRight: () => <svg data-testid="icon-arrow-up" />,
  ArrowDownRight: () => <svg data-testid="icon-arrow-down" />,
  Minus: () => <svg data-testid="icon-minus" />,
  Brain: () => <svg data-testid="icon-brain" />,
  MoreVertical: () => <svg data-testid="icon-more" />,
  ChevronRight: () => <svg data-testid="icon-chevron" />,
}));

// ─── STAT CARD TESTS ──────────────────────────────────────────────────────────
describe('StatCard Component', () => {
  it('renders the title correctly', async () => {
    const { default: StatCard } = await import('../StatCard.jsx');
    const { CheckSquare } = await import('lucide-react');
    render(<StatCard title="Active Tasks" value={42} icon={CheckSquare} trend={10} color="indigo" />);
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
  });

  it('renders the value correctly', async () => {
    const { default: StatCard } = await import('../StatCard.jsx');
    const { CheckSquare } = await import('lucide-react');
    render(<StatCard title="Active Tasks" value={42} icon={CheckSquare} trend={10} color="indigo" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows positive trend indicator for trend > 0', async () => {
    const { default: StatCard } = await import('../StatCard.jsx');
    const { CheckSquare } = await import('lucide-react');
    render(<StatCard title="Active Tasks" value={42} icon={CheckSquare} trend={12} color="indigo" />);
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('shows negative trend for trend < 0', async () => {
    const { default: StatCard } = await import('../StatCard.jsx');
    const { AlertCircle } = await import('lucide-react');
    render(<StatCard title="Blocked" value={3} icon={AlertCircle} trend={-5} color="rose" />);
    expect(screen.getByText(/-5%/)).toBeInTheDocument();
  });

  it('shows 0% for trend === 0', async () => {
    const { default: StatCard } = await import('../StatCard.jsx');
    const { CheckSquare } = await import('lucide-react');
    render(<StatCard title="Active Tasks" value={0} icon={CheckSquare} trend={0} color="indigo" />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });
});

// ─── TASK ITEM TESTS ──────────────────────────────────────────────────────────
describe('TaskItem Component', () => {
  it('renders task title', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="Fix API bug" project="Backend" assignee="JP" status="In Progress" aiSuggested={false} />);
    expect(screen.getByText('Fix API bug')).toBeInTheDocument();
  });

  it('renders the project name', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="Fix API bug" project="Backend" assignee="JP" status="In Progress" aiSuggested={false} />);
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('renders assignee initials', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="Fix API bug" project="Backend" assignee="JP" status="In Progress" aiSuggested={false} />);
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('renders AI badge when aiSuggested is true', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="AI Task" project="Core" assignee="AL" status="To Do" aiSuggested={true} />);
    expect(screen.getByText('AI Assigned')).toBeInTheDocument();
  });

  it('does not render AI badge when aiSuggested is false', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="Manual Task" project="Core" assignee="AL" status="To Do" aiSuggested={false} />);
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
  });

  it('renders the status correctly', async () => {
    const { default: TaskItem } = await import('../TaskItem.jsx');
    render(<TaskItem title="Task" project="Core" assignee="AL" status="Blocked" aiSuggested={false} />);
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });
});
