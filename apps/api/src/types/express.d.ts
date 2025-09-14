import { JWTUser } from '@sibyl/shared';

declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;
    }
  }
}

export {};
