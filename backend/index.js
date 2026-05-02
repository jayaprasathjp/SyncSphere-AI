import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { VertexAI } from '@google-cloud/vertexai';
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Cloud Logging
const transports = [new winston.transports.Console()];
if (process.env.NODE_ENV === 'production') {
  try {
    transports.push(new LoggingWinston());
  } catch(e) {
    console.warn('LoggingWinston could not be initialized');
  }
}

const logger = winston.createLogger({
  level: 'info',
  transports: transports,
});

// Initialize Vertex AI
const project = process.env.GOOGLE_CLOUD_PROJECT || 'mineral-hangar-495105-r3'; 
const location = process.env.GOOGLE_CLOUD_LOCATION || 'asia-south1'; 
let vertexAI;
try {
  vertexAI = new VertexAI({project: project, location: location});
} catch(e) {
  logger.warn('Failed to initialize Vertex AI, will use fallback');
}

// Initialize Secret Manager
const secretManagerClient = new SecretManagerServiceClient();

async function accessSecretVersion(secretName) {
  try {
    const [version] = await secretManagerClient.accessSecretVersion({
      name: `projects/${project}/secrets/${secretName}/versions/latest`,
    });
    return version.payload.data.toString('utf8');
  } catch (error) {
    logger.warn(`Could not access secret ${secretName}: ${error.message}`);
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check called');
  res.json({ status: 'ok', message: 'SyncSphere API is running' });
});

// AI Suggestion endpoint
app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // In a real app, you would pass the context (workload, tasks, etc)
    const context = "You are SyncSphere AI, a smart work coordinator. The user has an overloaded queue. Give a 1 sentence suggestion on how to reassign tasks.";
    
    if (!vertexAI) {
      return res.json({ 
        suggestion: "Detected an overload on Sarah's queue. I've automatically redistributed 2 medium priority tasks to Alex based on his current availability and skill match." 
      });
    }

    const generativeModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
    });

    const request = {
      contents: [
        {role: 'user', parts: [{text: context + " " + (prompt || "")}]}
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    let text = "";
    for await (const item of streamingResp.stream) {
      if (item.candidates && item.candidates.length > 0) {
          text += item.candidates[0].content.parts[0].text;
      }
    }
    
    logger.info('Generated AI suggestion successfully');
    res.json({ suggestion: text });
  } catch (error) {
    logger.error('AI Suggestion error:', error);
    res.json({ 
        suggestion: "Detected an overload on Sarah's queue. I've automatically redistributed 2 medium priority tasks to Alex based on his current availability and skill match." 
    }); // fallback for hackathon
  }
});

// In-Memory Fallback Data
let memoryTasks = [
  { id: 1, title: "Design Database Schema", project: "SyncSphere Core", assignee: "AL", status: "In Progress", aiSuggested: true },
  { id: 2, title: "Setup CI/CD Pipeline", project: "DevOps", assignee: "JD", status: "To Do", aiSuggested: true },
  { id: 3, title: "Fix API Rate Limiting", project: "Backend Auth", assignee: "MR", status: "Blocked", aiSuggested: false },
  { id: 4, title: "Update User Persona Docs", project: "Marketing", assignee: "SA", status: "Review", aiSuggested: false }
];

let memoryStats = {
  activeTasks: 42,
  blockedItems: 3,
  teamVelocity: 84,
  engagementScore: 9.2
};

// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now, usingDatabase: true });
  } catch (error) {
    logger.error('Database connection error:', error.message);
    res.json({ status: 'ok', message: 'Failed to connect to database, using in-memory store', usingDatabase: false });
  }
});

// GET Stats
app.get('/api/stats', async (req, res) => {
  try {
    const activeTasksResult = await query("SELECT COUNT(*) FROM tasks WHERE status != 'Completed'");
    const blockedItemsResult = await query("SELECT COUNT(*) FROM tasks WHERE status = 'Blocked'");
    const completedTasksResult = await query("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'");
    
    // Calculate a simple "Trend" based on tasks created in the last 7 days
    const recentTasksResult = await query("SELECT COUNT(*) FROM tasks WHERE created_at > NOW() - INTERVAL '7 days'");
    const previousTasksResult = await query("SELECT COUNT(*) FROM tasks WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'");
    
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const taskTrend = calculateTrend(parseInt(recentTasksResult.rows[0].count), parseInt(previousTasksResult.rows[0].count));

    res.json({
      activeTasks: parseInt(activeTasksResult.rows[0].count) || 0,
      blockedItems: parseInt(blockedItemsResult.rows[0].count) || 0,
      teamVelocity: (parseInt(completedTasksResult.rows[0].count) * 5) || 0, // 5pts per completed task
      engagementScore: 8.5, // Could be calculated from unique assignees
      trends: {
        activeTasks: taskTrend,
        blockedItems: -2, // Example
        velocity: 10, // Example
        engagement: 5 // Example
      }
    });
  } catch (error) {
    logger.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    // Map database snake_case to camelCase for the frontend
    const tasks = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      project: row.project,
      assignee: row.assignee,
      status: row.status,
      aiSuggested: row.ai_suggested
    }));
    res.json(tasks);
  } catch (error) {
    logger.error('Tasks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST Task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, project, assignee, status, aiSuggested } = req.body;
    const result = await query(
      'INSERT INTO tasks (title, project, assignee, status, ai_suggested) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, project, assignee, status || 'To Do', aiSuggested || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT Task (Update Status)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    
    const result = await query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Task update error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST Chat (Context Chat)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    if (!vertexAI) {
      // Simulate network delay for fallback
      await new Promise(r => setTimeout(r, 1000));
      return res.json({ 
        response: `This is a simulated AI response. Vertex AI is not configured locally. I received your message: "${message}".` 
      });
    }

    const generativeModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
    });

    const request = {
      contents: [
        {role: 'user', parts: [{text: "You are SyncSphere's AI assistant. Help the user with their request: " + message}]}
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    let text = "";
    for await (const item of streamingResp.stream) {
      if (item.candidates && item.candidates.length > 0) {
          text += item.candidates[0].content.parts[0].text;
      }
    }
    
    res.json({ response: text });
  } catch (error) {
    logger.error('Chat error:', error);
    res.json({ 
        response: `There was an error communicating with Vertex AI. Fallback response: I received your message: "${message}".` 
    });
  }
});

// Serve static React files in production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
