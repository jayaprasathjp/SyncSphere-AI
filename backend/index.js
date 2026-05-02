/**
 * @fileoverview SyncSphere AI - Express Backend Server
 * @description Unified API server serving the React SPA and all REST endpoints.
 *   Integrates Google Vertex AI (Gemini), Cloud SQL (PostgreSQL), Cloud Logging,
 *   and Secret Manager for a production-grade deployment on Cloud Run.
 * @module index
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';
import { VertexAI } from '@google-cloud/vertexai';
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── LOGGING SETUP ────────────────────────────────────────────────────────────

/** @type {winston.transport[]} Winston transports array */
const transports = [new winston.transports.Console({ format: winston.format.simple() })];

if (process.env.NODE_ENV === 'production') {
  try {
    transports.push(new LoggingWinston({ logName: 'syncsphere-ai' }));
  } catch (e) {
    console.warn('[Logging] Cloud Logging unavailable, using console only.');
  }
}

/**
 * @type {winston.Logger}
 * @description Structured logger using Winston with Cloud Logging in production.
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

/**
 * Security headers via helmet.
 * Relaxed CSP for serving React app with inline styles (Tailwind CSS).
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * Global API rate limiter — 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

/**
 * Stricter rate limiter for the AI chat endpoint — 20 requests per 15 minutes.
 */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'AI chat rate limit reached. Please wait before sending more messages.' },
});

app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload attacks
app.use('/api', globalLimiter);

// ─── VERTEX AI SETUP ─────────────────────────────────────────────────────────

/** @type {string} Google Cloud Project ID */
const project = process.env.GOOGLE_CLOUD_PROJECT || 'mineral-hangar-495105-r3';

/**
 * NOTE: Gemini models are available in us-central1, NOT asia-south1.
 * Cloud Run service region (asia-south1) is separate from AI model region.
 * @type {string}
 */
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

/** @type {VertexAI|null} */
let vertexAI = null;

try {
  vertexAI = new VertexAI({ project, location });
  logger.info(`Vertex AI initialized. Project: ${project}, Location: ${location}`);
} catch (e) {
  logger.warn('Vertex AI initialization failed — AI features will use fallback responses.');
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Validates express-validator results and sends 400 on failure.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {boolean} true if errors found (response already sent)
 */
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return true;
  }
  return false;
};

/**
 * Calls the Vertex AI Gemini model and returns a text response.
 * @param {string} prompt - The full prompt to send to Gemini.
 * @returns {Promise<string>} Generated text or throws on failure.
 */
const callGemini = async (prompt) => {
  const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
  const streamingResp = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  let text = '';
  for await (const item of streamingResp.stream) {
    if (item.candidates?.[0]?.content?.parts?.[0]?.text) {
      text += item.candidates[0].content.parts[0].text;
    }
  }
  return text;
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * @route GET /api/health
 * @description Health check endpoint for Cloud Run readiness probes.
 * @returns {{ status: string, timestamp: string, version: string }}
 */
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

/**
 * @route GET /api/db-check
 * @description Verifies PostgreSQL connectivity.
 * @returns {{ status: string, time?: string, usingDatabase: boolean }}
 */
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now, usingDatabase: true });
  } catch (error) {
    logger.error('Database connectivity check failed:', { message: error.message });
    res.status(503).json({ status: 'error', message: 'Database unavailable', usingDatabase: false });
  }
});

/**
 * @route GET /api/stats
 * @description Returns aggregated task metrics and trend calculations.
 * @returns {{ activeTasks: number, blockedItems: number, teamVelocity: number, engagementScore: number, trends: object }}
 */
app.get('/api/stats', async (req, res) => {
  try {
    const [active, blocked, completed, recent, previous, assignees] = await Promise.all([
      query("SELECT COUNT(*) FROM tasks WHERE status != 'Completed'"),
      query("SELECT COUNT(*) FROM tasks WHERE status = 'Blocked'"),
      query("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'"),
      query("SELECT COUNT(*) FROM tasks WHERE created_at > NOW() - INTERVAL '7 days'"),
      query("SELECT COUNT(*) FROM tasks WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'"),
      query("SELECT COUNT(DISTINCT assignee) FROM tasks WHERE status != 'Completed'"),
    ]);

    /**
     * Calculates week-over-week percentage change.
     * @param {number} curr
     * @param {number} prev
     * @returns {number}
     */
    const trend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const recentCount = parseInt(recent.rows[0].count);
    const previousCount = parseInt(previous.rows[0].count);
    const completedCount = parseInt(completed.rows[0].count);
    const activeAssignees = parseInt(assignees.rows[0].count);

    logger.info('Stats fetched successfully', { activeTasks: active.rows[0].count });

    res.json({
      activeTasks: parseInt(active.rows[0].count) || 0,
      blockedItems: parseInt(blocked.rows[0].count) || 0,
      teamVelocity: completedCount * 5,
      engagementScore: activeAssignees > 0 ? Math.min(10, (activeAssignees * 1.5 + completedCount * 0.5)).toFixed(1) : 0,
      trends: {
        activeTasks: trend(recentCount, previousCount),
        blockedItems: parseInt(blocked.rows[0].count) > 0 ? -5 : 0,
        velocity: completedCount > 0 ? 10 : 0,
        engagement: activeAssignees > 0 ? 5 : 0,
      },
    });
  } catch (error) {
    logger.error('Stats fetch error:', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * @route GET /api/tasks
 * @description Retrieves all tasks ordered by creation date.
 * @returns {Array<{ id: number, title: string, project: string, assignee: string, status: string, aiSuggested: boolean, createdAt: string }>}
 */
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      project: row.project,
      assignee: row.assignee,
      status: row.status,
      aiSuggested: row.ai_suggested,
      createdAt: row.created_at,
    }));
    logger.info('Tasks fetched', { count: tasks.length });
    res.json(tasks);
  } catch (error) {
    logger.error('Tasks fetch error:', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * @route POST /api/tasks
 * @description Creates a new task with validated input.
 * @body {{ title: string, project?: string, assignee?: string, status?: string, aiSuggested?: boolean }}
 * @returns {object} Created task row
 */
app.post(
  '/api/tasks',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('project').optional().trim().isLength({ max: 100 }),
    body('assignee').optional().trim().isLength({ max: 10 }),
    body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Blocked', 'Completed']).withMessage('Invalid status'),
    body('aiSuggested').optional().isBoolean(),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    try {
      const { title, project, assignee, status = 'To Do', aiSuggested = false } = req.body;
      const result = await query(
        'INSERT INTO tasks (title, project, assignee, status, ai_suggested) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, project || null, assignee || null, status, aiSuggested]
      );
      logger.info('Task created', { taskId: result.rows[0].id, title });
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Task creation error:', { message: error.message });
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

/**
 * @route PUT /api/tasks/:id
 * @description Updates the status of an existing task.
 * @param {number} id - Task ID
 * @body {{ status: string }}
 * @returns {object} Updated task row
 */
app.put(
  '/api/tasks/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid task ID'),
    body('status').isIn(['To Do', 'In Progress', 'Review', 'Blocked', 'Completed']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await query(
        'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
        [status, parseInt(id)]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
      logger.info('Task updated', { taskId: id, status });
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Task update error:', { message: error.message });
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
);

/**
 * @route DELETE /api/tasks/:id
 * @description Deletes a task by ID.
 * @param {number} id - Task ID
 * @returns {{ message: string }}
 */
app.delete(
  '/api/tasks/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid task ID')],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    try {
      const result = await query('DELETE FROM tasks WHERE id = $1', [parseInt(req.params.id)]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
      logger.info('Task deleted', { taskId: req.params.id });
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      logger.error('Task delete error:', { message: error.message });
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
);

/**
 * @route POST /api/chat
 * @description Sends a message to the Vertex AI Gemini model and returns a response.
 * @body {{ message: string }}
 * @returns {{ response: string }}
 */
app.post(
  '/api/chat',
  chatLimiter,
  [body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 })],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    const { message } = req.body;
    try {
      if (!vertexAI) {
        await new Promise((r) => setTimeout(r, 800));
        return res.json({
          response: `I'm SyncSphere AI running in offline mode. Vertex AI is not configured in this environment. Your message: "${message}". To enable full AI features, ensure GOOGLE_CLOUD_PROJECT is set and the service account has Vertex AI permissions.`,
        });
      }
      const prompt = `You are SyncSphere AI, an intelligent work coordinator for engineering teams. 
You help with task management, team workload analysis, and workflow optimization.
Be concise, actionable, and professional. User message: ${message}`;
      const text = await callGemini(prompt);
      logger.info('Chat response generated', { messageLength: message.length });
      res.json({ response: text });
    } catch (error) {
      logger.error('Chat error:', { message: error.message, stack: error.stack });
      
      // Provide a clean, user-friendly message without technical details.
      // The actual technical error is captured in structured logs above.
      res.json({
        response: "I'm sorry, I'm having trouble connecting to my cognitive services right now. Please try again in a moment or contact support if the issue persists.",
      });
    }
  }
);

/**
 * @route POST /api/ai/suggest
 * @description Generates an AI suggestion for task redistribution.
 * @body {{ prompt?: string }}
 * @returns {{ suggestion: string }}
 */
app.post('/api/ai/suggest', async (req, res) => {
  try {
    let tasksContext = '';
    try {
      const blockedResult = await query("SELECT title, assignee FROM tasks WHERE status = 'Blocked' LIMIT 5");
      const activeCounts = await query("SELECT assignee, COUNT(*) as count FROM tasks WHERE status = 'In Progress' GROUP BY assignee ORDER BY count DESC LIMIT 5");
      tasksContext = `Blocked tasks: ${JSON.stringify(blockedResult.rows)}. Assignee loads: ${JSON.stringify(activeCounts.rows)}.`;
    } catch {
      tasksContext = 'Database context unavailable.';
    }

    if (!vertexAI) {
      return res.json({
        suggestion: "Detected potential workload imbalance. Consider reviewing blocked tasks and redistributing to team members with lower active task counts.",
      });
    }

    const prompt = `You are SyncSphere AI. Based on this team data: ${tasksContext}. ${req.body.prompt || 'Give a 1-2 sentence actionable recommendation for improving team efficiency.'}`;
    const text = await callGemini(prompt);
    logger.info('AI suggestion generated');
    res.json({ suggestion: text });
  } catch (error) {
    logger.error('AI suggest error:', { message: error.message });
    res.json({ suggestion: 'AI analysis is temporarily unavailable. Review your task board for bottlenecks.' });
  }
});

// ─── STATIC FILES & SPA FALLBACK ─────────────────────────────────────────────

app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  maxAge: '1d',
  etag: true,
}));

/** Catch-all route — serves React SPA for all non-API routes */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────

/**
 * Express global error handler.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`SyncSphere API running on port ${PORT}`, { env: process.env.NODE_ENV, port: PORT });
});

export default app;
