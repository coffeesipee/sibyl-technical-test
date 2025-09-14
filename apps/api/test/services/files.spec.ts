import { FilesService } from '../../src/services/files';

describe('FilesService', () => {
  function makeDeps() {
    const prisma = {
      case: { findUnique: jest.fn() },
      caseFile: { create: jest.fn(), findUnique: jest.fn() },
      quote: { findFirst: jest.fn() },
    } as any;
    const storage = {
      uploadBuffer: jest.fn(async () => ({ key: 'k1' })),
      getSignedDownloadUrl: jest.fn(async () => 'https://signed-url'),
    };
    return { prisma, storage };
  }

  it('uploadFiles succeeds when client owns case', async () => {
    const { prisma, storage } = makeDeps();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'u1' });
    prisma.caseFile.create.mockResolvedValue({ id: 'f1' });

    const svc = new FilesService({ prisma, storage });
    const res = await svc.uploadFiles('c1', 'u1', [{ buffer: Buffer.from('a'), mimetype: 'application/pdf', originalname: 'a.pdf', size: 1 } as any]);
    expect('files' in res).toBe(true);
    expect(storage.uploadBuffer).toHaveBeenCalled();
  });

  it('uploadFiles forbids when client does not own case', async () => {
    const { prisma, storage } = makeDeps();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'other' });
    const svc = new FilesService({ prisma, storage });
    const res = await svc.uploadFiles('c1', 'u1', []);
    expect('forbidden' in res).toBe(true);
  });

  it('uploadFiles returns notFound when case missing', async () => {
    const { prisma, storage } = makeDeps();
    prisma.case.findUnique.mockResolvedValue(null);
    const svc = new FilesService({ prisma, storage });
    const res = await svc.uploadFiles('c1', 'u1', []);
    expect('notFound' in res).toBe(true);
  });

  it('getDownloadUrlForUser allows client owner', async () => {
    const { prisma, storage } = makeDeps();
    prisma.caseFile.findUnique = jest.fn().mockResolvedValue({ id: 'f1', key: 'k1', caseId: 'c1', case: { clientId: 'u1' } });
    const svc = new FilesService({ prisma, storage });
    const res = await svc.getDownloadUrlForUser({ id: 'u1', role: 'CLIENT' }, 'f1');
    expect((res as any).url).toBe('https://signed-url');
  });

  it('getDownloadUrlForUser forbids non-accepted lawyer', async () => {
    const { prisma, storage } = makeDeps();
    prisma.caseFile.findUnique = jest.fn().mockResolvedValue({ id: 'f1', key: 'k1', caseId: 'c1', case: { clientId: 'owner' } });
    prisma.quote.findFirst.mockResolvedValue(null);
    const svc = new FilesService({ prisma, storage });
    const res = await svc.getDownloadUrlForUser({ id: 'lawyer', role: 'LAWYER' }, 'f1');
    expect('forbidden' in res).toBe(true);
  });

  it('getDownloadUrlForUser returns notFound when file missing', async () => {
    const { prisma, storage } = makeDeps();
    prisma.caseFile.findUnique = jest.fn().mockResolvedValue(null);
    const svc = new FilesService({ prisma, storage });
    const res = await svc.getDownloadUrlForUser({ id: 'u1', role: 'CLIENT' }, 'fX');
    expect('notFound' in res).toBe(true);
  });
});
