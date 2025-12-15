import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { FirebaseModule } from '../../common/firebase/firebase.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [NotificationsModule, FirebaseModule, PrismaModule],
    controllers: [TestController],
})
export class TestModule { }
