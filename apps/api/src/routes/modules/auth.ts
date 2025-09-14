import { Router } from 'express';
import { validateBody } from '../../middlewares/validate';
import { LoginSchema, SignupClientSchema, SignupLawyerSchema } from '@sibyl/shared';
import { signJWT } from '../../utils/jwt';
import bcrypt from 'bcryptjs';
import { prisma } from '../../services/prisma';
import { AuthService } from '../../services/auth';

const router = Router();

const authService = new AuthService({ prisma, bcrypt, signJWT });

router.post('/signup/client', validateBody(SignupClientSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.signupClient({ email, password, name });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/signup/lawyer', validateBody(SignupLawyerSchema), async (req, res, next) => {
  try {
    const { email, password, name, jurisdiction, barNumber } = req.body;
    const result = await authService.signupLawyer({ email, password, name, jurisdiction, barNumber });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/login', validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
