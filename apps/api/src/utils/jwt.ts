import { sign } from 'jsonwebtoken';
import { env } from '../env';
import { JWTUser } from '@sibyl/shared';

export function signJWT(user: JWTUser, expiresIn: string = '7d') {
  return sign(user, env.JWT_SECRET as string, { expiresIn: expiresIn as any });
}
