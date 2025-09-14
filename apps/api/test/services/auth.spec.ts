import { AuthService } from '../../src/services/auth';

function createPrismaMock() {
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;
  return { prisma };
}

describe('AuthService', () => {
  const bcrypt = {
    hash: jest.fn(async (p: string) => `hashed:${p}`),
    compare: jest.fn(async (p: string, h: string) => h === `hashed:${p}`),
  };
  const signJWT = jest.fn(() => 'jwt_token');

  it('signupClient returns token and role/name', async () => {
    const { prisma } = createPrismaMock();
    prisma.user.create.mockResolvedValue({ id: 'u1', role: 'CLIENT', email: 'a@a.a', name: 'Alice' });
    const svc = new AuthService({ prisma, bcrypt, signJWT });
    const res = await svc.signupClient({ email: 'a@a.a', password: 'pass', name: 'Alice' });
    expect(res.token).toBe('jwt_token');
    expect(res.role).toBe('CLIENT');
    expect(res.name).toBe('Alice');
    expect(signJWT).toHaveBeenCalled();
  });

  it('signupLawyer returns token and role/name', async () => {
    const { prisma } = createPrismaMock();
    prisma.user.create.mockResolvedValue({ id: 'u2', role: 'LAWYER', email: 'b@b.b', name: 'Bob' });
    const svc = new AuthService({ prisma, bcrypt, signJWT });
    const res = await svc.signupLawyer({ email: 'b@b.b', password: 'pass', name: 'Bob' });
    expect(res.role).toBe('LAWYER');
    expect(res.name).toBe('Bob');
  });

  it('login succeeds with valid creds', async () => {
    const { prisma } = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'CLIENT', email: 'a@a.a', passwordHash: 'hashed:pass', name: 'Alice' });
    const svc = new AuthService({ prisma, bcrypt, signJWT });
    const res = await svc.login('a@a.a', 'pass');
    expect(res.token).toBe('jwt_token');
  });

  it('login throws on invalid creds', async () => {
    const { prisma } = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'CLIENT', email: 'a@a.a', passwordHash: 'hashed:other', name: 'Alice' });
    const svc = new AuthService({ prisma, bcrypt, signJWT });
    await expect(svc.login('a@a.a', 'pass')).rejects.toThrow('Invalid credentials');
  });
});
