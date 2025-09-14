export function getPagination(page: number, pageSize: number) {
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { skip, take };
}

export function buildPageMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
