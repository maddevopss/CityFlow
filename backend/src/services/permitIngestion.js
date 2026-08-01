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

const permitLookup = (permit) => ({
  municipalityId: permit.municipalityId,
  sourceType: 'PERMIT',
  sourceRef: permit.permit_id
});

function alreadyProcessed(existing) {
  const error = new Error('permit already processed');
  error.code = 'PERMIT_ALREADY_PROCESSED';
  error.eventId = existing.id;
  return error;
}

async function updateExistingDraft(prisma, existing, data) {
  if (existing.status !== 'DRAFT') {
    throw alreadyProcessed(existing);
  }

  const event = await prisma.roadEvent.update({
    where: { id: existing.id },
    data
  });

  return { event, operation: 'updated' };
}

async function ingestPermit(prisma, permit) {
  const data = buildPermitEventData(permit);
  const where = permitLookup(permit);
  const existing = await prisma.roadEvent.findFirst({
    where,
    select: { id: true, status: true }
  });

  if (existing) {
    return updateExistingDraft(prisma, existing, data);
  }

  try {
    const event = await prisma.roadEvent.create({ data });
    return { event, operation: 'created' };
  } catch (error) {
    if (error?.code !== 'P2002') throw error;

    const concurrent = await prisma.roadEvent.findFirst({
      where,
      select: { id: true, status: true }
    });

    if (!concurrent) throw error;
    return updateExistingDraft(prisma, concurrent, data);
  }
}

module.exports = {
  buildPermitEventData,
  ingestPermit,
  permitLookup,
  updateExistingDraft
};
