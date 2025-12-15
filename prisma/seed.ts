import { PrismaClient, UserRole, UserStatus, ServiceType, VehicleType, StaffRole, BadgeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  const permissions = [
    // User Management
    { name: 'View Users', code: 'users.view', module: 'users', description: 'View user list and details' },
    { name: 'Create Users', code: 'users.create', module: 'users', description: 'Create new users' },
    { name: 'Update Users', code: 'users.update', module: 'users', description: 'Update user information' },
    { name: 'Delete Users', code: 'users.delete', module: 'users', description: 'Delete users' },
    { name: 'Manage User Status', code: 'users.status', module: 'users', description: 'Activate/deactivate users' },
    
    // Role Management
    { name: 'View Roles', code: 'roles.view', module: 'roles', description: 'View roles and permissions' },
    { name: 'Create Roles', code: 'roles.create', module: 'roles', description: 'Create new roles' },
    { name: 'Update Roles', code: 'roles.update', module: 'roles', description: 'Update role permissions' },
    { name: 'Delete Roles', code: 'roles.delete', module: 'roles', description: 'Delete roles' },
    
    // Admin Management
    { name: 'View Admins', code: 'admins.view', module: 'admins', description: 'View admin accounts' },
    { name: 'Create Admins', code: 'admins.create', module: 'admins', description: 'Create admin accounts' },
    { name: 'Update Admins', code: 'admins.update', module: 'admins', description: 'Update admin accounts' },
    { name: 'Delete Admins', code: 'admins.delete', module: 'admins', description: 'Delete admin accounts' },
    
    // System Settings
    { name: 'View Settings', code: 'settings.view', module: 'settings', description: 'View system settings' },
    { name: 'Update Settings', code: 'settings.update', module: 'settings', description: 'Update system settings' },
    
    // Logs
    { name: 'View Logs', code: 'logs.view', module: 'logs', description: 'View system logs' },
    { name: 'View All Logs', code: 'logs.view.all', module: 'logs', description: 'View all system logs' },
    { name: 'Delete Logs', code: 'logs.delete', module: 'logs', description: 'Delete system logs' },
    
    // Analytics
    { name: 'View Analytics', code: 'analytics.view', module: 'analytics', description: 'View analytics dashboard' },
    { name: 'View Full Analytics', code: 'analytics.view.all', module: 'analytics', description: 'View full analytics' },
    
    // Permissions Management
    { name: 'View Permissions', code: 'permissions.view', module: 'permissions', description: 'View permissions' },
    { name: 'Assign Permissions', code: 'permissions.assign', module: 'permissions', description: 'Assign permissions to users' },
  ];

  console.log('Creating permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  // Create roles
  const roles = [
    { name: 'Super Admin', code: 'SUPER_ADMIN', description: 'Full system access' },
    { name: 'Admin', code: 'ADMIN', description: 'Limited administrative access' },
    { name: 'User', code: 'USER', description: 'Regular user access' },
  ];

  console.log('Creating roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  // Assign permissions to roles
  const superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });

  if (!superAdminRole || !adminRole) {
    throw new Error('Roles not found');
  }

  // Super Admin gets all permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets limited permissions
  const adminPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'users.view',
          'users.create',
          'users.update',
          'users.status',
          'logs.view',
          'analytics.view',
          'settings.view',
        ],
      },
    },
  });

  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create default users
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  console.log('Creating Super Admin user...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@carwash.com' },
    update: {},
    create: {
      email: 'superadmin@carwash.com',
      username: 'superadmin',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Creating Admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@carwash.com' },
    update: {},
    create: {
      email: 'admin@carwash.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdById: superAdmin.id,
    },
  });

  console.log('Creating Test User...');
  await prisma.user.upsert({
    where: { email: 'user@carwash.com' },
    update: {},
    create: {
      email: 'user@carwash.com',
      username: 'testuser',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  // Create default settings
  const settings = [
    {
      key: 'app.name',
      value: { value: 'CarWash+' },
      category: 'general',
      description: 'Application name',
      isPublic: true,
    },
    {
      key: 'app.version',
      value: { value: '1.0.0' },
      category: 'general',
      description: 'Application version',
      isPublic: true,
    },
    {
      key: 'security.max_login_attempts',
      value: { value: 5 },
      category: 'security',
      description: 'Maximum login attempts before lockout',
      isPublic: false,
    },
    {
      key: 'security.session_timeout',
      value: { value: 3600 },
      category: 'security',
      description: 'Session timeout in seconds',
      isPublic: false,
    },
  ];

  console.log('Creating settings...');
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create Car Wash Centers
  console.log('Creating car wash centers...');
  const center1 = await prisma.center.upsert({
    where: { id: 'center-downtown' },
    update: {},
    create: {
      id: 'center-downtown',
      name: 'Downtown Premium Wash',
      description: 'Full-service car wash in the heart of downtown',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1-555-0100',
      email: 'downtown@carwash.com',
      openTime: '08:00',
      closeTime: '20:00',
      capacity: 8,
      latitude: 40.7580,
      longitude: -73.9855,
      amenities: ['WiFi', 'Waiting Area', 'Coffee', 'Magazines'],
      isActive: true,
    },
  });

  const center2 = await prisma.center.upsert({
    where: { id: 'center-uptown' },
    update: {},
    create: {
      id: 'center-uptown',
      name: 'Uptown Express Wash',
      description: 'Quick and efficient car wash service',
      address: '456 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10022',
      phone: '+1-555-0200',
      email: 'uptown@carwash.com',
      openTime: '07:00',
      closeTime: '22:00',
      capacity: 10,
      latitude: 40.7614,
      longitude: -73.9776,
      amenities: ['WiFi', 'Express Service', 'Mobile App'],
      isActive: true,
    },
  });

  // Create Services
  console.log('Creating services...');
  const basicWash = await prisma.service.create({
    data: {
      centerId: center1.id,
      name: 'Basic Wash',
      description: 'Exterior wash and dry',
      type: ServiceType.BASIC_WASH,
      baseDuration: 20,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      centerId: center1.id,
      name: 'Premium Wash',
      description: 'Exterior wash, wax, and tire shine',
      type: ServiceType.PREMIUM_WASH,
      baseDuration: 35,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      centerId: center1.id,
      name: 'Deluxe Wash',
      description: 'Full exterior and interior detailing',
      type: ServiceType.DELUXE_WASH,
      baseDuration: 60,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      centerId: center1.id,
      name: 'Interior Cleaning',
      description: 'Vacuum, wipe down, and air freshener',
      type: ServiceType.INTERIOR_CLEAN,
      baseDuration: 30,
      isActive: true,
    },
  });

  // Create similar services for center 2
  await prisma.service.create({
    data: {
      centerId: center2.id,
      name: 'Express Wash',
      description: 'Quick exterior wash',
      type: ServiceType.BASIC_WASH,
      baseDuration: 15,
      isActive: true,
    },
  });

  // Create Service Pricing
  console.log('Creating service pricing...');
  const vehicleTypes = [VehicleType.SEDAN, VehicleType.SUV, VehicleType.TRUCK, VehicleType.VAN];
  const services = await prisma.service.findMany();

  for (const service of services) {
    const basePrices: { [key: string]: number } = {
      [VehicleType.SEDAN]: service.type === ServiceType.BASIC_WASH ? 15 : service.type === ServiceType.PREMIUM_WASH ? 30 : 50,
      [VehicleType.SUV]: service.type === ServiceType.BASIC_WASH ? 20 : service.type === ServiceType.PREMIUM_WASH ? 40 : 65,
      [VehicleType.TRUCK]: service.type === ServiceType.BASIC_WASH ? 25 : service.type === ServiceType.PREMIUM_WASH ? 45 : 70,
      [VehicleType.VAN]: service.type === ServiceType.BASIC_WASH ? 22 : service.type === ServiceType.PREMIUM_WASH ? 42 : 60,
    };

    for (const vehicleType of vehicleTypes) {
      await prisma.servicePricing.create({
        data: {
          serviceId: service.id,
          vehicleType,
          basePrice: basePrices[vehicleType] || 20,
          discount: 0,
          isActive: true,
        },
      });
    }
  }

  // Create Staff
  console.log('Creating staff members...');
  const staff1 = await prisma.staff.create({
    data: {
      centerId: center1.id,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson.downtown@carwash.com',
      phone: '+1-555-1001',
      role: StaffRole.MANAGER,
      hourlyRate: 25,
      rating: 4.8,
      totalJobs: 250,
      completedJobs: 245,
      isActive: true,
    },
  });

  const staff2 = await prisma.staff.create({
    data: {
      centerId: center1.id,
      firstName: 'David',
      lastName: 'Williams',
      email: 'david.williams@carwash.com',
      phone: '+1-555-1002',
      role: StaffRole.WASHER,
      hourlyRate: 18,
      rating: 4.9,
      totalJobs: 500,
      completedJobs: 492,
      isActive: true,
    },
  });

  await prisma.staff.create({
    data: {
      centerId: center1.id,
      firstName: 'Sarah',
      lastName: 'Davis',
      email: 'sarah.davis@carwash.com',
      phone: '+1-555-1003',
      role: StaffRole.WASHER,
      hourlyRate: 18,
      rating: 4.7,
      totalJobs: 380,
      completedJobs: 375,
      isActive: true,
    },
  });

  await prisma.staff.create({
    data: {
      centerId: center2.id,
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.brown@carwash.com',
      phone: '+1-555-1004',
      role: StaffRole.SUPERVISOR,
      hourlyRate: 22,
      rating: 4.6,
      totalJobs: 320,
      completedJobs: 315,
      isActive: true,
    },
  });

  // Create Staff Badges
  console.log('Creating staff badges...');
  await prisma.staffBadge.create({
    data: {
      staffId: staff2.id,
      type: BadgeType.GOLD,
      name: '500 Jobs Completed',
      description: 'Completed 500 successful car washes',
      icon: '🏆',
    },
  });

  await prisma.staffBadge.create({
    data: {
      staffId: staff2.id,
      type: BadgeType.PLATINUM,
      name: 'Top Performer',
      description: 'Highest rating for 3 consecutive months',
      icon: '⭐',
    },
  });

  // Create Customers
  console.log('Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-2001',
      loyaltyPoints: 250,
      totalSpent: 450,
      totalBookings: 15,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Emily',
      lastName: 'Taylor',
      email: 'emily.taylor@email.com',
      phone: '+1-555-2002',
      loyaltyPoints: 820,
      totalSpent: 1640,
      totalBookings: 52,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      firstName: 'Robert',
      lastName: 'Anderson',
      email: 'robert.anderson@email.com',
      phone: '+1-555-2003',
      loyaltyPoints: 150,
      totalSpent: 300,
      totalBookings: 10,
    },
  });

  // Create Customer Badges
  console.log('Creating customer badges...');
  await prisma.customerBadge.create({
    data: {
      customerId: customer2.id,
      type: BadgeType.GOLD,
      name: 'Loyal Customer',
      description: '50+ bookings completed',
      icon: '💎',
    },
  });

  await prisma.customerBadge.create({
    data: {
      customerId: customer2.id,
      type: BadgeType.PLATINUM,
      name: 'VIP Member',
      description: 'Spent over $1000',
      icon: '👑',
    },
  });

  // Create Vehicles
  console.log('Creating vehicles...');
  await prisma.vehicle.create({
    data: {
      customerId: customer1.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      licensePlate: 'ABC-1234',
      type: VehicleType.SEDAN,
    },
  });

  await prisma.vehicle.create({
    data: {
      customerId: customer2.id,
      make: 'Honda',
      model: 'CR-V',
      year: 2023,
      color: 'Blue',
      licensePlate: 'XYZ-5678',
      type: VehicleType.SUV,
    },
  });

  await prisma.vehicle.create({
    data: {
      customerId: customer3.id,
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      color: 'Black',
      licensePlate: 'DEF-9012',
      type: VehicleType.TRUCK,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Default Credentials:');
  console.log('Super Admin: superadmin@carwash.com / Admin@123');
  console.log('Admin: admin@carwash.com / Admin@123');
  console.log('User: user@carwash.com / Admin@123');
  console.log('\n🏢 Centers Created: 2');
  console.log('👥 Staff Members: 4');
  console.log('🚗 Customers: 3');
  console.log('🧼 Services: 5');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
