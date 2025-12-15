import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting superadmin password...');

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@carwash.com' },
    });

    if (!user) {
        console.log('❌ User superadmin@carwash.com not found!');
    } else {
        await prisma.user.update({
            where: { email: 'superadmin@carwash.com' },
            data: { password: hashedPassword },
        });
        console.log('✅ Password successfully reset for superadmin@carwash.com');
        console.log('New Password: Admin@123');
    }

    await prisma.user.upsert({
        where: { email: 'user@carwash.com' },
        update: { password: hashedPassword },
        create: {
            email: 'user@carwash.com',
            username: 'testuser',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Test user user@carwash.com ready with password Admin@123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
