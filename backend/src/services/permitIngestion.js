function buildPermitEventData(permit) {
  return {
    municipalityId: permit.municipalityId,
    eventType: 'CONSTRUCTION',
    subtype: 'travaux',
    geometry: permit.geometry,
    startTime: new Date(permit.start_date),
    endTime: permit.end_date ? new Date(permit.end_date) : null,
    impacts: permit.impacts,
    details: {
      contractor: permit.contractor,
      permit_id: permit.permit_id
    },
    sourceType: 'PERMIT',
    sourceRef: permit.permit_id,
    status: 'DRAFT'
  };
}

async function ingestPermit(prisma, permit) {
  const data = buildPermitEventData(permit);
  const existing = await prisma.roadEvent.findFirst({
    where: {
      municipalityId: permit.municipalityId,
      sourceType: 'PERMIT',
      sourceRef: permit.permit_id
    },
    select: { id: true, status: true }
  });

  if (!existing) {
    const event = await prisma.roadEvent.create({ data });
    return { event, operation: 'created' };
  }

  if (existing.status !== 'DRAFT') {
    const error = new Error('permit already processed');
    error.code = 'PERMIT_ALREADY_PROCESSED';
    error.eventId = existing.id;
    throw error;
  }

  const event = await prisma.roadEvent.update({
    where: { id: existing.id },
    data
  });

  return { event, operation: 'updated' };
}

module.exports = {
  buildPermitEventData,
  ingestPermit
};
