/**
 * @fileoverview Tests for the API service layer
 * @description Verifies that all API service functions correctly call fetch
 *   with the right URLs, methods, and request bodies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchStats,
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  sendChatMessage,
  fetchAiSuggestion,
  checkHealth,
} from '../../services/api';

// ─── MOCK FETCH ───────────────────────────────────────────────────────────────

const mockOkResponse = (data) => ({
  ok: true,
  json: () => Promise.resolve(data),
});

const mockErrorResponse = (status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: `HTTP ${status}` }),
});

beforeEach(() => {
  global.fetch = vi.fn();
});

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe('fetchStats', () => {
  it('calls GET /api/stats', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ activeTasks: 5 }));
    const result = await fetchStats();
    expect(global.fetch).toHaveBeenCalledWith('/api/stats', expect.objectContaining({}));
    expect(result.activeTasks).toBe(5);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue(mockErrorResponse(500));
    await expect(fetchStats()).rejects.toThrow();
  });
});

describe('fetchTasks', () => {
  it('calls GET /api/tasks and returns array', async () => {
    const tasks = [{ id: 1, title: 'Test', status: 'To Do' }];
    global.fetch.mockResolvedValue(mockOkResponse(tasks));
    const result = await fetchTasks();
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({}));
    expect(result).toEqual(tasks);
  });
});

describe('createTask', () => {
  it('calls POST /api/tasks with correct body', async () => {
    const taskData = { title: 'New Task', status: 'To Do' };
    global.fetch.mockResolvedValue(mockOkResponse({ id: 1, ...taskData }));
    const result = await createTask(taskData);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(taskData),
      })
    );
    expect(result.id).toBe(1);
  });

  it('throws on server error', async () => {
    global.fetch.mockResolvedValue(mockErrorResponse(400));
    await expect(createTask({ title: '' })).rejects.toThrow();
  });
});

describe('updateTaskStatus', () => {
  it('calls PUT /api/tasks/:id with status', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ id: 1, status: 'In Progress' }));
    await updateTaskStatus(1, 'In Progress');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'In Progress' }),
      })
    );
  });
});

describe('deleteTask', () => {
  it('calls DELETE /api/tasks/:id', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ message: 'Deleted' }));
    const result = await deleteTask(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.message).toBe('Deleted');
  });
});

describe('sendChatMessage', () => {
  it('calls POST /api/chat with message', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ response: 'AI response' }));
    const result = await sendChatMessage('Hello AI');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      })
    );
    expect(result.response).toBe('AI response');
  });
});

describe('fetchAiSuggestion', () => {
  it('calls POST /api/ai/suggest', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ suggestion: 'Optimize workload' }));
    const result = await fetchAiSuggestion('Custom prompt');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/suggest',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.suggestion).toBe('Optimize workload');
  });
});

describe('checkHealth', () => {
  it('returns health status', async () => {
    global.fetch.mockResolvedValue(mockOkResponse({ status: 'ok', version: '1.0.0' }));
    const result = await checkHealth();
    expect(result.status).toBe('ok');
  });
});
