import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    }
  });

  console.log('\n📋 Existing Customers:\n');
  console.log('=====================================');
  
  if (customers.length === 0) {
    console.log('❌ No customers found in database.');
    console.log('\n💡 You need to create a customer before making a booking.');
    console.log('   Use the mobile app to register, or create via API.');
  } else {
    customers.forEach((customer, index) => {
      console.log(`\n${index + 1}. ${customer.firstName} ${customer.lastName}`);
      console.log(`   ID: ${customer.id}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone}`);
    });
  }

  console.log('\n=====================================\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
