const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const backupScript = fs.readFileSync(path.join(root, 'scripts/backup-postgres.sh'), 'utf8');
const restoreScript = fs.readFileSync(path.join(root, 'scripts/restore-postgres.sh'), 'utf8');

describe('scripts de sauvegarde PostgreSQL', () => {
  test('produit une sauvegarde custom, un inventaire et une empreinte', () => {
    expect(backupScript).toContain('pg_dump --format=custom');
    expect(backupScript).toContain('pg_restore --list');
    expect(backupScript).toContain('sha256sum');
    expect(backupScript).toContain('BACKUP_RETENTION_DAYS');
  });

  test('refuse une restauration sans confirmation explicite', () => {
    expect(restoreScript).toContain('CONFIRM_RESTORE');
    expect(restoreScript).toContain('CONFIRM_RESTORE}" != "YES"');
    expect(restoreScript).toContain('pg_restore --exit-on-error');
    expect(restoreScript).toContain('sha256sum --check');
  });
});
