import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private app: admin.app.App;

    onModuleInit() {
        try {
            const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

            this.app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin SDK initialized with Service Account');
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        }
    }

    async sendPushNotification(
        fcmToken: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<boolean> {
        if (!this.app) {
            console.warn('⚠️ Firebase not initialized, skipping push notification');
            return false;
        }

        try {
            const message: admin.messaging.Message = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                token: fcmToken,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
            };

            const response = await admin.messaging().send(message);
            console.log('✅ Push notification sent:', response);
            return true;
        } catch (error) {
            console.error('❌ Failed to send push notification:', error.message);
            return false;
        }
    }

    async sendPushToMultipleTokens(
        tokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<string[]> {
        if (!this.app || tokens.length === 0) {
            return [];
        }

        try {
            const message: admin.messaging.MulticastMessage = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                tokens,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            console.log(`✅ Sent ${response.successCount}/${tokens.length} push notifications`);

            const failedTokens: string[] = [];
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const error = resp.error;
                        // Identify tokens to remove
                        if (error?.code === 'messaging/registration-token-not-registered' ||
                            error?.code === 'messaging/invalid-registration-token') {
                            failedTokens.push(tokens[idx]);
                        }
                        console.error(`Failed to send to token ${idx}:`, resp.error);
                    }
                });
            }
            return failedTokens;
        } catch (error) {
            console.error('❌ Failed to send multicast push:', error.message);
            return [];
        }
    }
}
