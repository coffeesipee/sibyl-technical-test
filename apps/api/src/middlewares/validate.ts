import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';

export function validateBody(schema: AnyZodObject) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(parsed.error);
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: AnyZodObject) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return next(parsed.error);
    req.query = parsed.data as any;
    next();
  };
}
