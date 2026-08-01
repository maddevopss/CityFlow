const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const protocol = process.env.OTEL_EXPORTER_OTLP_PROTOCOL || 'http/protobuf';

if (!endpoint) {
  console.error('OTEL_EXPORTER_OTLP_ENDPOINT requis');
  process.exit(1);
}

let url;
try {
  url = new URL(endpoint);
} catch {
  console.error('Endpoint OTLP invalide');
  process.exit(1);
}

if (!['https:', 'http:'].includes(url.protocol)) {
  console.error('Protocole OTLP non autorisé');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
  console.error('HTTPS obligatoire en production');
  process.exit(1);
}

if (!['http/protobuf', 'grpc'].includes(protocol)) {
  console.error('OTEL_EXPORTER_OTLP_PROTOCOL invalide');
  process.exit(1);
}

console.log(JSON.stringify({ endpoint: url.origin, protocol, valid: true }));
