import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: Replace these coordinates with YOUR location!
  // To get your coordinates:
  // 1. Open Google Maps
  // 2. Right-click on your location
  // 3. Click the coordinates to copy them
  
  const YOUR_LATITUDE = 48.8566;  // Change this!
  const YOUR_LONGITUDE = 2.3522;   // Change this!
  
  console.log(`Adding car wash at coordinates: ${YOUR_LATITUDE}, ${YOUR_LONGITUDE}`);
  
  const center = await prisma.center.upsert({
    where: { id: 'my-local-center' },
    update: {
      latitude: YOUR_LATITUDE,
      longitude: YOUR_LONGITUDE,
      updatedAt: new Date(),
    },
    create: {
      id: 'my-local-center',
      name: 'My Local Car Wash',
      description: 'A great car wash near me!',
      address: '123 Local Street',
      city: 'My City',
      state: 'My State',
      zipCode: '12345',
      phone: '+1-555-LOCAL',
      email: 'local@carwash.com',
      openTime: '08:00',
      closeTime: '20:00',
      capacity: 5,
      latitude: YOUR_LATITUDE,
      longitude: YOUR_LONGITUDE,
      amenities: ['WiFi', 'Waiting Area', 'Coffee'],
      isActive: true,
    },
  });

  console.log('✅ Car wash added/updated:', center.name);
  console.log('📍 Location:', center.latitude, center.longitude);
  console.log('\n🎉 Now open your mobile app and you should see this car wash on the map!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
