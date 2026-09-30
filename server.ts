import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/server/apiHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// API routes handled by handleApiRequest
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    const handled = handleApiRequest(req, res);
    if (!handled) {
      next();
    }
  } else {
    next();
  }
});

// Serve static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HeatSafe Routes server running on http://0.0.0.0:${PORT}`);
});
