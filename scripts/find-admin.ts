import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all admin and super admin users
  const admins = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' }
      ]
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true
    }
  });

  console.log('\n🔐 Admin Users Found:\n');
  console.log('=====================================');
  
  if (admins.length === 0) {
    console.log('No admin users found in database.');
  } else {
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.firstName || ''} ${admin.lastName || ''}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Phone: ${admin.phone || 'N/A'}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.status}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
    });
  }

  console.log('\n=====================================');
  console.log('\n⚠️  NOTE: Passwords are hashed and cannot be displayed.');
  console.log('💡 TIP: Check your seed file or ask who created the accounts.\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
