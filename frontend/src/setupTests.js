import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

/**
 * Mock framer-motion to avoid animation issues in test environment.
 * Replaces motion.* components with their plain HTML equivalents.
 */
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      // Return a plain React component for any motion.tag (motion.div, motion.article, etc.)
      const Component = ({ children, ...props }) => {
        // Strip framer-motion-specific props before passing to DOM
        const {
          whileHover, whileTap, whileFocus, whileInView,
          initial, animate, exit, transition, variants,
          layout, layoutId, drag, dragConstraints,
          ...domProps
        } = props;
        return React.createElement(tag, domProps, children);
      };
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  }),
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useMotionValue: (v) => ({ get: () => v, set: vi.fn() }),
}));

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
  if (url.includes('/api/health')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' }),
    });
  }
  // Default empty response for unmapped routes
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});
