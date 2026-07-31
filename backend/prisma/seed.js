const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  const cities = [
    { name: 'Québec', code: 'QC-QC', population: 549459 },
    { name: 'Lévis', code: 'QC-LE', population: 149683 },
    { name: 'Sherbrooke', code: 'QC-SH', population: 172950 },
  ];

  for (const city of cities) {
    await prisma.municipality.create({ data: city });
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@cityflow.quebec',
      password: adminPassword,
      fullName: 'Administrateur CityFlow',
      role: 'ADMIN',
      municipalityId: 1,
    },
  });

  console.log('✅ Seed terminé !');
  console.log('📧 Admin: admin@cityflow.quebec / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
