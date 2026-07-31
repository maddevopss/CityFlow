const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function requireSeedAdminPassword() {
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD doit contenir au moins 12 caractères');
  }

  return password;
}

async function main() {
  console.log('🌱 Démarrage du seed...');

  const cities = [
    { name: 'Québec', code: 'QC-QC', population: 549459 },
    { name: 'Lévis', code: 'QC-LE', population: 149683 },
    { name: 'Sherbrooke', code: 'QC-SH', population: 172950 }
  ];

  const municipalities = [];

  for (const city of cities) {
    const municipality = await prisma.municipality.upsert({
      where: { name: city.name },
      update: {
        code: city.code,
        population: city.population
      },
      create: city
    });

    municipalities.push(municipality);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cityflow.local';
  const adminPassword = await bcrypt.hash(requireSeedAdminPassword(), 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      fullName: 'Administrateur CityFlow',
      role: 'ADMIN',
      municipalityId: municipalities[0].id,
      isActive: true
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      fullName: 'Administrateur CityFlow',
      role: 'ADMIN',
      municipalityId: municipalities[0].id,
      isActive: true
    }
  });

  console.log('✅ Seed terminé');
  console.log(`📧 Compte administrateur créé ou mis à jour : ${adminEmail}`);
  console.log('🔐 Le mot de passe provient de SEED_ADMIN_PASSWORD et n’est jamais affiché.');
}

main()
  .catch((error) => {
    console.error('❌ Échec du seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
