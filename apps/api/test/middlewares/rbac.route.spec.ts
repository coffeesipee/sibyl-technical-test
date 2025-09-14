import express from 'express';
import request from 'supertest';
import { requireRole } from '../../src/middlewares/rbac';

describe('RBAC middleware wiring (integration)', () => {
  function makeApp() {
    const app = express();
    // fake auth middleware to set req.user from header
    app.use((req: any, _res, next) => {
      const role = req.header('x-mock-role');
      if (role) req.user = { id: 'u1', role };
      next();
    });
    app.get('/protected', requireRole('LAWYER' as any), (_req, res) => res.json({ ok: true }));
    return app;
  }

  it('returns 200 for LAWYER', async () => {
    const app = makeApp();
    await request(app).get('/protected').set('x-mock-role', 'LAWYER').expect(200, { ok: true });
  });

  it('returns 403 for CLIENT', async () => {
    const app = makeApp();
    await request(app).get('/protected').set('x-mock-role', 'CLIENT').expect(403);
  });

  it('returns 401 when user missing', async () => {
    const app = makeApp();
    await request(app).get('/protected').expect(401);
  });
});
