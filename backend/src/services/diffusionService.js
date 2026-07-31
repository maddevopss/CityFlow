const axios = require('axios');
const prisma = require('../db/prisma');
const config = require('../config');
const logger = require('../logger');

class DiffusionService {
  async pushToWaze(municipalityId) {
    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId }
    });

    if (!municipality?.wazeCcpKey) {
      logger.info(`Pas de clé Waze pour la municipalité ${municipalityId}`);
      return;
    }

    const events = await prisma.roadEvent.findMany({
      where: {
        municipalityId,
        status: { in: ['PLANNED', 'ACTIVE'] }
      }
    });

    const features = events.map(event => ({
      type: 'Feature',
      geometry: event.geometry,
      properties: {
        type: event.eventType === 'INCIDENT' ? 'HAZARD' : 'ROAD_CLOSED',
        subtype: event.subtype,
        starttime: event.startTime.toISOString(),
        endtime: event.endTime?.toISOString(),
        description: `${event.eventType} - ${event.subtype}`,
        reference: event.id
      }
    }));

    const geojson = { type: 'FeatureCollection', features };

    try {
      await axios.post(config.wazeCcpUrl, geojson, {
        headers: {
          'Authorization': `Bearer ${municipality.wazeCcpKey}`,
          'Content-Type': 'application/json'
        }
      });
      logger.info(`Diffusion Waze réussie pour municipalité ${municipalityId}`);
    } catch (err) {
      logger.error('Erreur diffusion Waze', { error: err.message });
    }
  }
}

module.exports = new DiffusionService();
