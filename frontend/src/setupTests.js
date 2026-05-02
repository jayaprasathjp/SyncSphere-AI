import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Global fetch mock — returns sensible defaults for all API calls.
 * Prevents "Invalid URL" errors when components try to fetch /api/* in test env.
 */
global.fetch = vi.fn((url) => {
  if (url.includes('/api/stats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        activeTasks: 5,
        blockedItems: 1,
        teamVelocity: 15,
        engagementScore: 8.5,
        trends: { activeTasks: 10, blockedItems: -2, velocity: 5, engagement: 3 },
      }),
    });
  }
  if (url.includes('/api/tasks')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'Test Task', project: 'Core', assignee: 'JP', status: 'In Progress', aiSuggested: false },
      ]),
    });
  }
  if (url.includes('/api/ai/suggest')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ suggestion: 'Consider redistributing blocked tasks.' }),
    });
  }
  if (url.includes('/api/chat')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ response: 'AI response here.' }),
    });
  }
  // Default empty response
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});
