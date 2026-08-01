const ALLOWED_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'REJECTED', 'CLOSED'];

function buildPermitRegisterQuery({ municipalityId, status, q, page = 1, pageSize = 25 }) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 25));
  const where = { municipalityId, sourceType: 'PERMIT' };

  if (status) where.status = status;
  if (q) {
    where.OR = [
      { sourceRef: { contains: q, mode: 'insensitive' } },
      { subtype: { contains: q, mode: 'insensitive' } }
    ];
  }

  return {
    where,
    skip: (normalizedPage - 1) * normalizedPageSize,
    take: normalizedPageSize,
    page: normalizedPage,
    pageSize: normalizedPageSize
  };
}

async function listMunicipalPermits(db, input) {
  const query = buildPermitRegisterQuery(input);
  const [items, total] = await Promise.all([
    db.roadEvent.findMany({
      where: query.where,
      skip: query.skip,
      take: query.take,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        sourceRef: true,
        status: true,
        subtype: true,
        startTime: true,
        endTime: true,
        impacts: true,
        details: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    db.roadEvent.count({ where: query.where })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize))
    }
  };
}

module.exports = { ALLOWED_STATUSES, buildPermitRegisterQuery, listMunicipalPermits };
