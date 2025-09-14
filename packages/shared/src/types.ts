import { z } from 'zod';

export enum UserRole {
  CLIENT = 'CLIENT',
  LAWYER = 'LAWYER',
}

export const Roles = z.enum([UserRole.CLIENT, UserRole.LAWYER]);

export const CaseStatus = z.enum(['open', 'engaged', 'closed', 'cancelled']);
export type TCaseStatus = z.infer<typeof CaseStatus>;

export const QuoteStatus = z.enum(['proposed', 'accepted', 'rejected']);
export type TQuoteStatus = z.infer<typeof QuoteStatus>;

export const CaseCategory = z.enum([
  'contract',
  'ip',
  'family',
  'criminal',
  'immigration',
  'corporate',
  'other',
]);
export type TCaseCategory = z.infer<typeof CaseCategory>;

export const CaseCreateSchema = z.object({
  title: z.string().min(3).max(120),
  category: CaseCategory,
  description: z.string().min(10).max(5000),
});
export type CaseCreateInput = z.infer<typeof CaseCreateSchema>;

export const QuoteUpsertSchema = z.object({
  amount: z.number().int().positive().max(1_000_000_000),
  expectedDays: z.number().int().positive().max(3650),
  note: z.string().max(2000).optional().default(''),
  caseId: z.string().nonempty()
});
export type QuoteUpsertInput = z.infer<typeof QuoteUpsertSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const MarketplaceFilterSchema = z.object({
  category: CaseCategory.optional(),
  created_since: z.string().datetime().optional(),
});
export type MarketplaceFilter = z.infer<typeof MarketplaceFilterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
});

export const SignupLawyerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
  jurisdiction: z.string().max(120).optional(),
  barNumber: z.string().max(120).optional(),
});

export type JWTUser = {
  id: string;
  role: UserRole;
  email: string;
};
