import { UserRole } from '@sibyl/shared';

export interface FilesServiceDeps {
  prisma: {
    case: { findUnique: Function };
    caseFile: { create: Function; findUnique: Function };
    quote: { findFirst: Function };
  };
  storage: {
    uploadBuffer: (opts: { buffer: Buffer; contentType: string; keyPrefix: string }) => Promise<{ key: string }>;
    getSignedDownloadUrl: (key: string) => Promise<string>;
  };
}

export class FilesService {
  constructor(private deps: FilesServiceDeps) {}

  async ensureClientOwnsCase(clientId: string, caseId: string) {
    const c = await this.deps.prisma.case.findUnique({ where: { id: caseId } });
    if (!c) return { notFound: true } as const;
    if (c.clientId !== clientId) return { forbidden: true } as const;
    return { ok: true as const };
  }

  async uploadFiles(caseId: string, userId: string, files: { buffer: Buffer; mimetype: string; originalname: string; size: number }[]) {
    const own = await this.ensureClientOwnsCase(userId, caseId);
    if ('notFound' in own) return own;
    if ('forbidden' in own) return own;

    const saved: any[] = [];
    for (const f of files) {
      const { key } = await this.deps.storage.uploadBuffer({ buffer: f.buffer, contentType: f.mimetype, keyPrefix: `cases/${caseId}` });
      const rec = await this.deps.prisma.caseFile.create({ data: { caseId, key, mime: f.mimetype, originalName: f.originalname, size: f.size } });
      saved.push(rec);
    }
    return { files: saved };
  }

  async getDownloadUrlForUser(user: { id: string; role: 'CLIENT' | 'LAWYER' }, fileId: string) {
    const file = await this.deps.prisma.caseFile.findUnique({ where: { id: fileId }, include: { case: true } });
    if (!file) return { notFound: true } as const;

    if (user.role === 'CLIENT' && file.case.clientId !== user.id) return { forbidden: true } as const;
    if (user.role === 'LAWYER') {
      const accepted = await this.deps.prisma.quote.findFirst({ where: { caseId: file.caseId, lawyerId: user.id, status: 'accepted' } });
      if (!accepted) return { forbidden: true } as const;
    }

    const url = await this.deps.storage.getSignedDownloadUrl(file.key);
    return { url };
  }
}
