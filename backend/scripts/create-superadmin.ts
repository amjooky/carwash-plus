import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
    try {
        // Check if superadmin already exists
        const existing = await prisma.user.findUnique({
            where: { email: 'superadmin@carwash.com' },
        });

        if (existing) {
            console.log('✅ Superadmin already exists!');
            console.log('Email: superadmin@carwash.com');
            console.log('Username:', existing.username);
            return;
        }

        // Create superadmin
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

        const superadmin = await prisma.user.create({
            data: {
                email: 'superadmin@carwash.com',
                username: 'superadmin',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
            },
        });

        console.log('✅ Superadmin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: superadmin@carwash.com');
        console.log('👤 Username: superadmin');
        console.log('🔑 Password: SuperAdmin123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating superadmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
