import { requireRole } from '../../src/middlewares/rbac';

describe('requireRole middleware (unit)', () => {
  function makeMocks() {
    const req: any = { user: null };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
  }

  it('calls next() when role matches', () => {
    const { req, res, next } = makeMocks();
    req.user = { id: 'u1', role: 'LAWYER' };
    const mw = requireRole('LAWYER' as any);
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when role differs', () => {
    const { req, res, next } = makeMocks();
    req.user = { id: 'u1', role: 'CLIENT' };
    const mw = requireRole('LAWYER' as any);
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user is missing', () => {
    const { req, res, next } = makeMocks();
    req.user = null;
    const mw = requireRole('LAWYER' as any);
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
