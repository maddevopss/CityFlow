const prisma = require('../../db/prisma');
const diffusionService = require('../../services/diffusionService');

module.exports = async (job) => {
  const { eventId } = job.data;
  const event = await prisma.roadEvent.findUnique({ where: { id: eventId } });
  
  if (!event) {
    throw new Error(`Événement ${eventId} non trouvé`);
  }

  await diffusionService.pushToWaze(event.municipalityId);
};
