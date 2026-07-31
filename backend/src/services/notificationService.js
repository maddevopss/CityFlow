const logger = require('../logger');

class NotificationService {
  async notifyAgent(event) {
    // TODO: Implémenter l'envoi d'email
    logger.info(`Notification pour l'événement ${event.id}`);
  }

  async sendToEntrepreneur(email, link) {
    // TODO: Implémenter l'envoi d'email
    logger.info(`Lien envoyé à ${email}: ${link}`);
  }
}

module.exports = new NotificationService();
