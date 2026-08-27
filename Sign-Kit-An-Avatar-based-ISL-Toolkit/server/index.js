// server/index.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Speech-to-Text endpoint – proxies to local Python service (faster-whisper)
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const pythonUrl =
      process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

    const languageHint = req.query.language || req.body.language || req.body.languageHint;

    const audioBuffer = fs.readFileSync(req.file.path);

    const form = new FormData();

    form.append(
      'audio',
      new Blob([audioBuffer], {
        type: req.file.mimetype || 'audio/webm',
      }),
      req.file.originalname || 'recording.webm'
    );

    if (languageHint && languageHint !== 'auto') {
      form.append('language', languageHint);
    }

    const queryStr = languageHint && languageHint !== 'auto' ? `?language=${encodeURIComponent(languageHint)}` : '';

    console.log('[STT] Sending audio to Python:', `${pythonUrl}/speech-to-text${queryStr}`);
    console.log('[STT] File:', req.file.originalname, 'Size:', req.file.size, 'MIME:', req.file.mimetype);
    console.log('[STT] Language hint:', languageHint || 'auto');

    const response = await fetch(`${pythonUrl}/speech-to-text${queryStr}`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json();

    console.log('[STT] Python status:', response.status);
    console.log('[STT] Python response:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('[STT] Proxy error:', err);
    res.status(500).json({
      error: 'Speech recognition failed',
      details: err.message,
    });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

// Translation endpoint (Indi language -> English)
app.post('/api/translate-to-english', async (req, res) => {
  const { text, sourceLanguage } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }
  try {
    const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    console.log('[Translate] Forwarding to Python:', pythonUrl, { text, sourceLanguage });
    const response = await fetch(`${pythonUrl}/translate-to-english`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLanguage }),
    });
    const data = await response.json();
    console.log('[Translate] Python status:', response.status, data);
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Translation proxy error', err);
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
});

app.post('/api/text-to-speech', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }
  try {
    const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${pythonUrl}/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    // Proxy the audio stream back to the client
    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
  } catch (err) {
    console.error('TTS proxy error', err);
    res.status(500).json({ error: 'Text-to-speech failed', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
