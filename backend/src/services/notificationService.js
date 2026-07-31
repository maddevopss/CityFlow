class NotificationService {
  async notifyAgent(event) {
    // TODO: Implémenter l'envoi d'email
    console.log(`📧 Notification pour l'événement ${event.id}`);
  }

  async sendToEntrepreneur(email, link) {
    // TODO: Implémenter l'envoi d'email
    console.log(`📧 Lien envoyé à ${email}: ${link}`);
  }
}

module.exports = new NotificationService();
