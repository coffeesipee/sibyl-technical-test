import { Router } from 'express';
import auth from './modules/auth';
import cases from './modules/cases';
import quotes from './modules/quotes';
import files from './modules/files';
import payments from './modules/payments';

export const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/cases', cases);
router.use('/quotes', quotes);
router.use('/files', files);
router.use('/payments', payments);
