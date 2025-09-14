import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { UserRole } from '@sibyl/shared';
import { uploadBuffer, getSignedDownloadUrl } from '../../services/storage';
import { prisma } from '../../services/prisma';
import { FilesService } from '../../services/files';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  },
});

const router = Router();

const filesService = new FilesService({
  prisma,
  storage: {
    uploadBuffer: (opts) => uploadBuffer(opts),
    getSignedDownloadUrl: (key) => getSignedDownloadUrl(key),
  },
});

// Client: upload files to a case (max 10 files enforced on FE; BE can check count as well)
router.post('/:caseId/upload', authenticateJWT, requireRole(UserRole.CLIENT), upload.array('files', 10) as any, async (req, res, next) => {
  try {
    const caseId = req.params.caseId;
    const files = (req.files as Express.Multer.File[]) || [];
    const result = await filesService.uploadFiles(caseId, req.user!.id, files);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// Lawyer (accepted) or Client: get signed download URL for a file
router.get('/download/:fileId', authenticateJWT, async (req, res, next) => {
  try {
    const id = req.params.fileId;
    const result = await filesService.getDownloadUrlForUser({ id: req.user!.id, role: req.user!.role }, id);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
