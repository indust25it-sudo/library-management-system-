import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getBooks,
  addBook,
  getMembers,
  addMember,
  getIssues,
  issueBook,
  returnBook,
  calculateFine,
  getStats,
  isSupabaseConnected
} from './backend/db.js';
import { askLibraryAI } from './backend/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Production Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json());

const staticPath = path.join(__dirname, 'frontend');

// Production Health Check Route for Orchestrators & Monitoring
app.get(['/health', '/healthz'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    database: isSupabaseConnected() ? 'Supabase PostgreSQL' : 'Local Fallback'
  });
});

// Explicit PWA Endpoints with Standards Headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(staticPath, 'sw.js'));
});

app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(staticPath, 'manifest.webmanifest'));
});

app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('manifest.webmanifest') || filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    }
  }
}));

// API Routes

// System & Database Status
app.get('/api/status', async (req, res) => {
  res.json({
    status: 'online',
    database: isSupabaseConnected() ? 'Supabase PostgreSQL' : 'Local (Supabase configured for connection)',
    supabaseConfigured: isSupabaseConnected()
  });
});

// Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FR-01: Books Management
app.get('/api/books', async (req, res) => {
  try {
    const { search = '', filter = 'all' } = req.query;
    const books = await getBooks(search, filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, category, copies } = req.body;
    if (!title || !author || !category) {
      return res.status(400).json({ error: 'Title, author, and category are required' });
    }
    const book = await addBook(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FR-04: Student Members
app.get('/api/members', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const members = await getMembers(search);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { member_id, name, department, email } = req.body;
    if (!member_id || !name || !department) {
      return res.status(400).json({ error: 'Member ID, name, and department are required' });
    }
    const member = await addMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FR-02 & FR-05: Book Issues & Due Dates
app.get('/api/issues', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const issues = await getIssues(filter);
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const { book_id, book_title, member_id, member_name, issue_date, due_date } = req.body;
    if (!book_title || !member_name) {
      return res.status(400).json({ error: 'Book and member are required' });
    }
    const issue = await issueBook(req.body);
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FR-03: Return Book
app.post('/api/returns', async (req, res) => {
  try {
    const { book_title, return_date } = req.body;
    if (!book_title) {
      return res.status(400).json({ error: 'Book title is required' });
    }
    const result = await returnBook(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FR-06: Calculate Fine
app.post('/api/fines/calculate', async (req, res) => {
  try {
    const { overdue_days, fine_per_day, member_name, book_title } = req.body;
    const fine = await calculateFine({ overdue_days, fine_per_day, member_name, book_title });
    res.json(fine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Assistant & Operations Copilot (Grounded with real-time library data)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    const result = await askLibraryAI(message, conversationHistory);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal AI error' });
  }
});

// Wildcard SPA route
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Supabase connection: ${isSupabaseConnected() ? 'Enabled' : 'Configured (awaiting SUPABASE_URL / KEY)'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
