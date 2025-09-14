import type { UserRole as PrismaUserRole } from "@prisma/client";
import type { JWTUser, UserRole as SharedUserRole } from "@sibyl/shared";

export interface AuthServiceDeps {
  prisma: {
    user: {
      findUnique: Function;
      create: Function;
    };
  };
  bcrypt: { hash: (p: string, s: number) => Promise<string>; compare: (p: string, h: string) => Promise<boolean> };
  signJWT: (payload: JWTUser) => string;
}

export class AuthService {
  constructor(private deps: AuthServiceDeps) {}

  async signupClient(input: { email: string; password: string; name?: string }) {
    const hash = await this.deps.bcrypt.hash(input.password, 10);
    const user = await this.deps.prisma.user.create({ data: { email: input.email, passwordHash: hash, role: "CLIENT", name: input.name } });
    const token = this.deps.signJWT({ id: user.id, role: user.role as unknown as SharedUserRole, email: user.email });
    return { token, role: user.role, name: user.name };
  }

  async signupLawyer(input: { email: string; password: string; name?: string; jurisdiction?: string; barNumber?: string }) {
    const hash = await this.deps.bcrypt.hash(input.password, 10);
    const user = await this.deps.prisma.user.create({ data: { email: input.email, passwordHash: hash, role: "LAWYER", name: input.name, jurisdiction: input.jurisdiction, barNumber: input.barNumber } });
    const token = this.deps.signJWT({ id: user.id, role: user.role as unknown as SharedUserRole, email: user.email });
    return { token, role: user.role, name: user.name };
  }

  async login(email: string, password: string): Promise<{ token: string; role?: PrismaUserRole; name: string }> {
    const user = await this.deps.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const ok = await this.deps.bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');
    const token = this.deps.signJWT({ id: user.id, role: user.role as unknown as SharedUserRole, email: user.email });
    return { token, role: user.role, name: user.name };
  }
}
