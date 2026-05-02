/**
 * @fileoverview SyncSphere AI — Centralized API Service Layer
 * @description All HTTP calls go through this module. Centralizing API calls
 *   ensures consistent error handling, base URL management, and easy mocking in tests.
 *   Uses relative paths so the same code works in local dev (via Vite proxy) and production (Cloud Run).
 * @module services/api
 */

/** @type {string} Base API path — empty string means relative to current origin */
const BASE = '';

/**
 * Performs a typed fetch and throws on non-OK HTTP status.
 * @template T
 * @param {string} path - API path (e.g. '/api/tasks')
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<T>} Parsed JSON response
 * @throws {Error} On non-2xx HTTP status or network failure
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── STATS ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Stats
 * @property {number} activeTasks - Count of non-completed tasks
 * @property {number} blockedItems - Count of blocked tasks
 * @property {number} teamVelocity - Completed task velocity score
 * @property {number|string} engagementScore - Team engagement score out of 10
 * @property {{ activeTasks: number, blockedItems: number, velocity: number, engagement: number }} trends
 */

/**
 * Fetches aggregated team stats and trends from the database.
 * @returns {Promise<Stats>}
 */
export const fetchStats = () => apiFetch('/api/stats');

// ─── TASKS ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} project
 * @property {string} assignee
 * @property {'To Do'|'In Progress'|'Review'|'Blocked'|'Completed'} status
 * @property {boolean} aiSuggested
 * @property {string} createdAt
 */

/**
 * Fetches all tasks ordered by creation date.
 * @returns {Promise<Task[]>}
 */
export const fetchTasks = () => apiFetch('/api/tasks');

/**
 * Creates a new task.
 * @param {{ title: string, project?: string, assignee?: string, status?: string, aiSuggested?: boolean }} data
 * @returns {Promise<Task>} Created task
 */
export const createTask = (data) =>
  apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) });

/**
 * Updates the status of an existing task.
 * @param {number} id - Task ID
 * @param {string} status - New status value
 * @returns {Promise<Task>} Updated task
 */
export const updateTaskStatus = (id, status) =>
  apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });

/**
 * Deletes a task by ID.
 * @param {number} id - Task ID
 * @returns {Promise<{ message: string }>}
 */
export const deleteTask = (id) =>
  apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });

// ─── AI ───────────────────────────────────────────────────────────────────────

/**
 * Sends a message to the Vertex AI chat endpoint.
 * @param {string} message - User message
 * @returns {Promise<{ response: string }>}
 */
export const sendChatMessage = (message) =>
  apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message }) });

/**
 * Requests an AI-generated workload suggestion.
 * @param {string} [prompt] - Optional custom prompt
 * @returns {Promise<{ suggestion: string }>}
 */
export const fetchAiSuggestion = (prompt) =>
  apiFetch('/api/ai/suggest', { method: 'POST', body: JSON.stringify({ prompt }) });

// ─── HEALTH ───────────────────────────────────────────────────────────────────

/**
 * Health check — used for connectivity testing.
 * @returns {Promise<{ status: string, timestamp: string, version: string }>}
 */
export const checkHealth = () => apiFetch('/api/health');
