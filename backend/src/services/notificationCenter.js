'use strict';

const CHANNELS = new Set(['IN_APP', 'EMAIL', 'SMS']);

function resolveChannels(eventType, preferences = {}) {
  const safePreferences = preferences || {};
  const configured = safePreferences[eventType] || safePreferences.DEFAULT || ['IN_APP'];
  const configuredChannels = Array.isArray(configured) ? configured : [configured];
  const channels = [...new Set(configuredChannels.map((channel) => String(channel).toUpperCase()))]
    .filter((channel) => CHANNELS.has(channel));
  return channels.length ? channels : ['IN_APP'];
}

function buildNotification({ municipalityId, recipientId, eventType, template, data, preferences }) {
  if (!municipalityId || !recipientId || !eventType || !template) throw new Error('invalid notification input');
  const channels = resolveChannels(eventType, preferences);
  const subject = String(template.subject || '').replace(/\{(\w+)\}/g, (_, key) => String(data?.[key] ?? ''));
  const body = String(template.body || '').replace(/\{(\w+)\}/g, (_, key) => String(data?.[key] ?? ''));
  if (!subject.trim() || !body.trim()) throw new Error('invalid rendered notification');
  return {
    municipalityId,
    recipientId,
    eventType,
    channels,
    subject: subject.trim().slice(0, 200),
    body: body.trim().slice(0, 5000),
    status: 'PENDING',
    attempts: 0,
    createdAt: new Date().toISOString()
  };
}

function scheduleRetry(notification, now = new Date()) {
  const attempts = Number(notification.attempts || 0) + 1;
  if (attempts > 5) return { ...notification, attempts, status: 'FAILED', nextAttemptAt: null };
  const delayMinutes = Math.min(60, 2 ** attempts);
  return {
    ...notification,
    attempts,
    status: 'RETRYING',
    nextAttemptAt: new Date(now.getTime() + delayMinutes * 60000).toISOString()
  };
}

function acknowledgeNotification(notification, actor) {
  if (notification.recipientId !== actor?.id || notification.municipalityId !== actor?.municipalityId) {
    const error = new Error('notification not found');
    error.status = 404;
    throw error;
  }
  return { ...notification, status: 'READ', readAt: new Date().toISOString() };
}

module.exports = { CHANNELS, resolveChannels, buildNotification, scheduleRetry, acknowledgeNotification };
