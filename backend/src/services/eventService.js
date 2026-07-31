const prisma = require('../db/prisma');

class EventService {
  async create(data, user) {
    return prisma.roadEvent.create({
      data: {
        ...data,
        municipalityId: user.municipalityId,
        createdBy: user.sub
      }
    });
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters.municipalityId) where.municipalityId = parseInt(filters.municipalityId);
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.status) where.status = filters.status;
    
    return prisma.roadEvent.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });
  }

  async findById(id) {
    return prisma.roadEvent.findUnique({ where: { id } });
  }

  async update(id, data, user) {
    const event = await this.findById(id);
    if (!event) throw new Error('Événement non trouvé');
    if (event.municipalityId !== user.municipalityId && user.role !== 'ADMIN') {
      throw new Error('Non autorisé');
    }
    return prisma.roadEvent.update({ where: { id }, data });
  }
}

module.exports = new EventService();
