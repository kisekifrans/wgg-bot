require('dotenv').config();

const express = require('express');
const path = require('path');
const {
  getStore,
  createPanel,
  updatePanel,
  deletePanel,
  createCustomCommand,
  updateCustomCommand,
  deleteCustomCommand,
  saveStore,
} = require('../utils/store');
const { getAllCategories } = require('../config/ticketCategories');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3847;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'wgg-admin';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../legacy-dashboard/public')));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || header !== `Bearer ${DASHBOARD_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === DASHBOARD_PASSWORD) {
    return res.json({ token: DASHBOARD_PASSWORD });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

app.get('/api/categories', authMiddleware, (_req, res) => {
  const categories = getAllCategories().map((category) => ({
    key: category.id,
    label: category.label,
    emoji: category.emoji,
  }));
  res.json(categories);
});

app.get('/api/store', authMiddleware, (_req, res) => {
  res.json(getStore());
});

app.get('/api/panels', authMiddleware, (_req, res) => {
  res.json(getStore().panels);
});

app.post('/api/panels', authMiddleware, (req, res) => {
  const panel = createPanel(req.body);
  res.status(201).json(panel);
});

app.put('/api/panels/:id', authMiddleware, (req, res) => {
  const panel = updatePanel(req.params.id, req.body);
  if (!panel) {
    return res.status(404).json({ error: 'Panel not found' });
  }
  return res.json(panel);
});

app.delete('/api/panels/:id', authMiddleware, (req, res) => {
  const deleted = deletePanel(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Panel not found' });
  }
  return res.json({ success: true });
});

app.get('/api/commands', authMiddleware, (_req, res) => {
  res.json(getStore().customCommands);
});

app.post('/api/commands', authMiddleware, (req, res) => {
  const command = createCustomCommand(req.body);
  res.status(201).json(command);
});

app.put('/api/commands/:id', authMiddleware, (req, res) => {
  const command = updateCustomCommand(req.params.id, req.body);
  if (!command) {
    return res.status(404).json({ error: 'Command not found' });
  }
  return res.json(command);
});

app.delete('/api/commands/:id', authMiddleware, (req, res) => {
  const deleted = deleteCustomCommand(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Command not found' });
  }
  return res.json({ success: true });
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const store = getStore();
  if (typeof req.body.ticketCounter === 'number' && req.body.ticketCounter >= 0) {
    store.ticketCounter = Math.floor(req.body.ticketCounter);
    saveStore(store);
  }
  res.json({ ticketCounter: store.ticketCounter });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../legacy-dashboard/public/index.html'));
});

function startDashboard() {
  app.listen(PORT, () => {
    console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
  });
}

module.exports = { startDashboard };
