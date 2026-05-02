/**
 * @fileoverview API Integration Tests for SyncSphere AI Backend
 * @description Tests all REST API endpoints using Supertest.
 *   Mocks the database module to run without a live PostgreSQL connection.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// ─── MOCKS ────────────────────────────────────────────────────────────────────

// Mock the database module before importing the app
vi.mock('../db.js', () => ({
  query: vi.fn(async (sql) => {
    // Return realistic mock data based on the SQL query
    if (sql.includes("status != 'Completed'")) return { rows: [{ count: '5' }], rowCount: 1 };
    if (sql.includes("status = 'Blocked'")) return { rows: [{ count: '1' }], rowCount: 1 };
    if (sql.includes("status = 'Completed'")) return { rows: [{ count: '3' }], rowCount: 1 };
    if (sql.includes('INTERVAL')) return { rows: [{ count: '2' }], rowCount: 1 };
    if (sql.includes('DISTINCT assignee')) return { rows: [{ count: '4' }], rowCount: 1 };
    if (sql.includes('SELECT * FROM tasks')) {
      return {
        rows: [
          { id: 1, title: 'Test Task', project: 'Test Project', assignee: 'JP', status: 'To Do', ai_suggested: false, created_at: new Date() },
        ],
        rowCount: 1,
      };
    }
    if (sql.includes('INSERT INTO tasks')) {
      return {
        rows: [{ id: 2, title: 'New Task', project: 'Proj', assignee: 'AL', status: 'To Do', ai_suggested: false, created_at: new Date() }],
        rowCount: 1,
      };
    }
    if (sql.includes('UPDATE tasks')) {
      return { rows: [{ id: 1, status: 'In Progress' }], rowCount: 1 };
    }
    if (sql.includes('DELETE FROM tasks')) {
      return { rows: [], rowCount: 1 };
    }
    if (sql.includes('SELECT NOW()')) {
      return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }),
}));

// Mock Vertex AI to avoid real API calls in tests
vi.mock('@google-cloud/vertexai', () => ({
  VertexAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { candidates: [{ content: { parts: [{ text: 'AI test response' }] } }] };
        })(),
      }),
    }),
  })),
}));

vi.mock('@google-cloud/logging-winston', () => ({
  LoggingWinston: vi.fn().mockImplementation(() => ({ on: vi.fn() })),
}));

// ─── LOAD APP ─────────────────────────────────────────────────────────────────

let app;
beforeAll(async () => {
  const mod = await import('../index.js');
  app = mod.default;
});

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('should return status ok with timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBeDefined();
  });
});

describe('GET /api/stats', () => {
  it('should return stats object with all required fields', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('activeTasks');
    expect(res.body).toHaveProperty('blockedItems');
    expect(res.body).toHaveProperty('teamVelocity');
    expect(res.body).toHaveProperty('engagementScore');
    expect(res.body).toHaveProperty('trends');
    expect(typeof res.body.activeTasks).toBe('number');
    expect(typeof res.body.blockedItems).toBe('number');
  });

  it('should return trends as an object', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.body.trends).toHaveProperty('activeTasks');
    expect(res.body.trends).toHaveProperty('blockedItems');
    expect(res.body.trends).toHaveProperty('velocity');
    expect(res.body.trends).toHaveProperty('engagement');
  });
});

describe('GET /api/tasks', () => {
  it('should return an array of tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('tasks should have required fields', async () => {
    const res = await request(app).get('/api/tasks');
    if (res.body.length > 0) {
      const task = res.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('aiSuggested');
    }
  });
});

describe('POST /api/tasks', () => {
  it('should create a task with valid data', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'New Test Task', project: 'Test', assignee: 'JP', status: 'To Do' });
    expect(res.status).toBe(201);
  });

  it('should reject a task with no title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ project: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject invalid status value', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task', status: 'InvalidStatus' });
    expect(res.status).toBe(400);
  });

  it('should reject title that is too long', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'A'.repeat(300) });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('should update task status with valid data', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ status: 'In Progress' });
    expect(res.status).toBe(200);
  });

  it('should reject invalid task ID', async () => {
    const res = await request(app)
      .put('/api/tasks/abc')
      .send({ status: 'In Progress' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid status value', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ status: 'Unknown' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('should delete a task successfully', async () => {
    const res = await request(app).delete('/api/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });

  it('should reject non-integer task ID', async () => {
    const res = await request(app).delete('/api/tasks/notanid');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/chat', () => {
  it('should return a response for a valid message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is the team status?' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('response');
    expect(typeof res.body.response).toBe('string');
  });

  it('should reject empty message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '' });
    expect(res.status).toBe(400);
  });

  it('should reject message exceeding length limit', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'A'.repeat(2001) });
    expect(res.status).toBe(400);
  });
});

describe('Security Headers', () => {
  it('should have X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should have X-Frame-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
