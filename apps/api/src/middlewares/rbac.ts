import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '@sibyl/shared';

export function requireRole(role: UserRole) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}
