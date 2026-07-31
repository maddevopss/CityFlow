const axios = require('axios');
const prisma = require('../db/prisma');

class DiffusionService {
  async pushToWaze(municipalityId) {
    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId }
    });
    
    if (!municipality?.wazeCcpKey) {
      console.log(`Pas de clé Waze pour la municipalité ${municipalityId}`);
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
      await axios.post(process.env.WAZE_CCP_URL, geojson, {
        headers: {
          'Authorization': `Bearer ${municipality.wazeCcpKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Diffusion Waze réussie pour municipalité ${municipalityId}`);
    } catch (err) {
      console.error(`❌ Erreur diffusion Waze:`, err.message);
    }
  }
}

module.exports = new DiffusionService();
