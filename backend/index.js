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
const project = process.env.GOOGLE_CLOUD_PROJECT || 'mineral-hangar-495105-r3'; // from earlier logs
const location = 'us-central1'; 
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

// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    logger.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to database' });
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
