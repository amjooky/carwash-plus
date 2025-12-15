import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const centerName = process.argv[4];

  if (!email || !password || !centerName) {
    console.log('\n📖 Usage: npm run create-owner <email> <password> <centerName>');
    console.log('Example: npm run create-owner owner@lavagesami.tn Password123 "Lavage Sami"\n');
    process.exit(1);
  }

  // Find the center
  const center = await prisma.center.findFirst({
    where: { name: { contains: centerName, mode: 'insensitive' } },
  });

  if (!center) {
    console.log(`\n❌ Center "${centerName}" not found in database.`);
    console.log('\n💡 Available centers:');
    const centers = await prisma.center.findMany({ select: { name: true } });
    centers.forEach((c) => console.log(`   - ${c.name}`));
    process.exit(1);
  }

  // Check if center already has an owner
  if (center.ownerId) {
    const existingOwner = await prisma.user.findUnique({ where: { id: center.ownerId } });
    console.log(`\n⚠️  Center "${center.name}" already has an owner: ${existingOwner?.email}`);
    console.log('Do you want to replace the owner? (This will NOT delete the old user)');
  }

  // Check if email exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`\n❌ Email "${email}" is already in use.`);
    process.exit(1);
  }

  // Create the owner account
  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split('@')[0];

  const owner = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName: center.name.split(' ')[0],
      lastName: 'Owner',
      role: UserRole.ADMIN,
    },
  });

  // Link the center to the owner
  await prisma.center.update({
    where: { id: center.id },
    data: { ownerId: owner.id },
  });

  console.log('\n✅ Center owner created successfully!\n');
  console.log('=====================================');
  console.log(`Center: ${center.name}`);
  console.log(`Owner Email: ${owner.email}`);
  console.log(`Owner Username: ${owner.username}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${owner.role}`);
  console.log('=====================================\n');
  console.log('🔐 Login URL:');
  console.log('   Admin Panel: http://localhost:3001/admin');
  console.log('   Owner Panel: http://localhost:3001/owner\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
