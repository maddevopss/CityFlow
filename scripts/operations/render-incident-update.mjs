const [severity, status, impact, nextUpdate] = process.argv.slice(2);
const allowed = new Set(['P1', 'P2', 'P3', 'P4']);
if (!allowed.has(severity) || !status || !impact || !nextUpdate) {
  console.error('Usage: node render-incident-update.mjs P1|P2|P3|P4 statut impact prochaine_mise_a_jour');
  process.exit(1);
}

const safe = (value) => value.replace(/[\r\n]+/g, ' ').replace(/(token|password|secret)\s*[:=]\s*\S+/gi, '$1=[MASQUÉ]');
console.log(`# Mise à jour incident ${severity}\n\n- Statut : ${safe(status)}\n- Impact : ${safe(impact)}\n- Prochaine mise à jour : ${safe(nextUpdate)}\n- Heure UTC : ${new Date().toISOString()}\n`);
