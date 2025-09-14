import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  req.log?.error({ err }, 'Unhandled error');

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', details: err.flatten() });
  }

  const status = err.status || 500;
  const code = err.code || 'InternalServerError';
  const message = err.message || 'Something went wrong';
  res.status(status).json({ error: code, message });
}
