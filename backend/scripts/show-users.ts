import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showUsers() {
    console.log('\n📋 USER CREDENTIALS\n');
    console.log('='.repeat(80));

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            phone: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (users.length === 0) {
        console.log('No users found in database.');
        return;
    }

    users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`   ID: ${user.id}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal Users: ${users.length}`);

    // Show role breakdown
    const roleCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Users by Role:');
    Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
    });

    console.log('\n⚠️  NOTE: Passwords are hashed and cannot be displayed.');
    console.log('   To reset a password, use the password reset functionality.');
    console.log('\n💡 TIP: You can view and edit users in Prisma Studio at http://localhost:5555\n');
}

showUsers()
    .catch((e) => {
        console.error('Error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
