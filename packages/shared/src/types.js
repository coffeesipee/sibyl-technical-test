"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupLawyerSchema = exports.SignupClientSchema = exports.LoginSchema = exports.MarketplaceFilterSchema = exports.PaginationQuerySchema = exports.QuoteUpsertSchema = exports.CaseCreateSchema = exports.CaseCategory = exports.QuoteStatus = exports.CaseStatus = exports.Roles = exports.UserRole = void 0;
const zod_1 = require("zod");
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "CLIENT";
    UserRole["LAWYER"] = "LAWYER";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.Roles = zod_1.z.enum([UserRole.CLIENT, UserRole.LAWYER]);
exports.CaseStatus = zod_1.z.enum(['open', 'engaged', 'closed', 'cancelled']);
exports.QuoteStatus = zod_1.z.enum(['proposed', 'accepted', 'rejected']);
exports.CaseCategory = zod_1.z.enum([
    'contract',
    'ip',
    'family',
    'criminal',
    'immigration',
    'corporate',
    'other',
]);
exports.CaseCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120),
    category: exports.CaseCategory,
    description: zod_1.z.string().min(10).max(5000),
});
exports.QuoteUpsertSchema = zod_1.z.object({
    amount: zod_1.z.number().int().positive().max(1_000_000_000),
    expectedDays: zod_1.z.number().int().positive().max(3650),
    note: zod_1.z.string().max(2000).optional().default(''),
    caseId: zod_1.z.string().nonempty()
});
exports.PaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
exports.MarketplaceFilterSchema = zod_1.z.object({
    category: exports.CaseCategory.optional(),
    created_since: zod_1.z.string().datetime().optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.SignupClientSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1).max(120).optional(),
});
exports.SignupLawyerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1).max(120).optional(),
    jurisdiction: zod_1.z.string().max(120).optional(),
    barNumber: zod_1.z.string().max(120).optional(),
});
