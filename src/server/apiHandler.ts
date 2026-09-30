import { IncomingMessage, ServerResponse } from 'http';
import { dbStore } from './db';
import { TamilNaduCity, UserProfile } from '../types';

export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. Server-Sent Events (Real-time synchronization)
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const unsubscribe = dbStore.subscribeClient(clientId, (chunk) => {
      res.write(chunk);
    });

    // Send initial greeting / heartbeat
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    const heartbeatTimer = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeatTimer);
      unsubscribe();
    });
    return true;
  }

  // Helper to parse JSON body
  const parseJsonBody = (callback: (body: any) => void) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        callback(parsed);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
  };

  // 2. Care Points
  if (pathname === '/api/care-points' && req.method === 'GET') {
    const city = (urlObj.searchParams.get('city') as TamilNaduCity) || undefined;
    const type = urlObj.searchParams.get('type') || undefined;
    const womenOnly = urlObj.searchParams.get('womenOnly') === 'true';
    const freeOnly = urlObj.searchParams.get('freeOnly') === 'true';

    const points = dbStore.getCarePoints({ city, type, womenOnly, freeOnly });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(points));
    return true;
  }

  if (pathname === '/api/care-points' && req.method === 'POST') {
    parseJsonBody((body) => {
      if (!body.name || !body.lat || !body.lng || !body.type) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required care point fields' }));
        return;
      }
      const created = dbStore.addCarePoint(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(created));
    });
    return true;
  }

  // 3. Ratings
  if (pathname === '/api/ratings' && req.method === 'GET') {
    const carePointId = urlObj.searchParams.get('carePointId') || undefined;
    const ratings = dbStore.getRatings(carePointId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ratings));
    return true;
  }

  if (pathname === '/api/ratings' && req.method === 'POST') {
    parseJsonBody((body) => {
      if (!body.carePointId || !body.cleanlinessRating || !body.safetyRating) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing rating details' }));
        return;
      }
      const created = dbStore.addRating(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(created));
    });
    return true;
  }

  // 4. Reports
  if (pathname === '/api/reports' && req.method === 'GET') {
    const carePointId = urlObj.searchParams.get('carePointId') || undefined;
    const reports = dbStore.getReports(carePointId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reports));
    return true;
  }

  if (pathname === '/api/reports' && req.method === 'POST') {
    parseJsonBody((body) => {
      if (!body.carePointId || !body.issueType) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing report issueType or carePointId' }));
        return;
      }
      const created = dbStore.addReport(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(created));
    });
    return true;
  }

  // 5. Auth (Worker login / register / profile)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    parseJsonBody((body) => {
      const { phone, guestName } = body;
      if (!phone && !guestName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Phone or guestName required' }));
        return;
      }

      if (phone) {
        const existing = dbStore.findUserByPhone(phone);
        if (existing) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ user: existing, token: `auth-${existing.id}` }));
          return;
        }
      }

      // Create new worker profile
      const newUser: UserProfile = {
        id: `worker-${Date.now()}`,
        name: body.name || guestName || 'Delivery Partner',
        phone: body.phone || 'GUEST',
        platform: body.platform || 'swiggy',
        vehicle: body.vehicle || 'two_wheeler',
        city: body.city || 'chennai',
        role: body.role || 'gig_worker',
        womenFriendlyOnly: Boolean(body.womenFriendlyOnly),
        freeOnly: Boolean(body.freeOnly),
        preferredLanguage: body.preferredLanguage || 'ta',
        createdAt: new Date().toISOString(),
        isGuest: Boolean(!phone),
      };

      dbStore.saveUser(newUser);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user: newUser, token: `auth-${newUser.id}` }));
    });
    return true;
  }

  if (pathname === '/api/auth/update' && req.method === 'POST') {
    parseJsonBody((body) => {
      if (!body.id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User id required' }));
        return;
      }
      const updated = dbStore.saveUser(body as UserProfile);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user: updated }));
    });
    return true;
  }

  // 6. City statistics & Heat Infrastructure analytics
  if (pathname === '/api/stats' && req.method === 'GET') {
    const stats = dbStore.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return true;
  }

  // 7. Open Data Export (CSV or GeoJSON)
  if (pathname === '/api/export' && req.method === 'GET') {
    const format = urlObj.searchParams.get('format') === 'geojson' ? 'geojson' : 'csv';
    const data = dbStore.getExportData(format);

    if (format === 'geojson') {
      res.writeHead(200, {
        'Content-Type': 'application/geo+json',
        'Content-Disposition': 'attachment; filename="heatsafe-tamilnadu-care-network.geojson"',
      });
      res.end(JSON.stringify(data, null, 2));
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="heatsafe-tamilnadu-care-network.csv"',
      });
      res.end(data);
    }
    return true;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API route not found' }));
  return true;
}
