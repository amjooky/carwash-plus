'use client';

import { useState } from 'react';
import { Send, Bell, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            alert('Please fill in both title and message');
            return;
        }

        setIsSending(true);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                `${API_URL}/notifications/broadcast`,
                { title, message },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccessMessage(`✅ Notification sent to ${response.data.count} users!`);
            setTitle('');
            setMessage('');

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error: any) {
            console.error('Failed to send notification:', error);
            alert(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Broadcast Notifications</h1>
                <p className="text-slate-600 mt-1">Send promotional messages to all active users</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-green-800 font-medium">{successMessage}</p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Notification Form */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl bg-white p-6 shadow-lg border-2 border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="rounded-full bg-purple-100 p-3">
                                <Send className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Create Notification</h2>
                                <p className="text-sm text-slate-600">Compose your message to all users</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendNotification} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Notification Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Special Offer - 20% Off!"
                                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    maxLength={100}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">{title.length}/100 characters</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your promotional message here..."
                                    rows={6}
                                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    maxLength={500}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">{message.length}/500 characters</p>
                            </div>

                            {/* Preview */}
                            {(title || message) && (
                                <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">PREVIEW</p>
                                    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-purple-100 p-2">
                                                <Bell className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900">{title || 'Notification Title'}</h3>
                                                <p className="text-sm text-slate-600 mt-1">{message || 'Your message will appear here...'}</p>
                                                <p className="text-xs text-slate-400 mt-2">Just now</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={isSending || !title.trim() || !message.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-4 text-white font-semibold hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                            >
                                {isSending ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Send to All Users
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-4">
                    {/* Stats Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 shadow-lg text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-8 w-8" />
                            <h3 className="text-lg font-bold">Broadcast Reach</h3>
                        </div>
                        <p className="text-3xl font-bold mb-2">All Active Users</p>
                        <p className="text-purple-100 text-sm">
                            Your notification will be sent to all users with active accounts
                        </p>
                    </div>

                    {/* Tips Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg border-2 border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-purple-600" />
                            Best Practices
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">•</span>
                                <span>Keep titles short and attention-grabbing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">•</span>
                                <span>Include clear call-to-action in message</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">•</span>
                                <span>Avoid sending too frequently</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">•</span>
                                <span>Use emojis sparingly for emphasis</span>
                            </li>
                        </ul>
                    </div>

                    {/* Examples Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg border-2 border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">Example Messages</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setTitle('🎉 Weekend Special - 20% Off!');
                                    setMessage('Book your car wash this weekend and get 20% off all services. Limited time offer!');
                                }}
                                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition text-sm"
                            >
                                <p className="font-semibold text-slate-900">Weekend Special</p>
                                <p className="text-xs text-slate-600">Promotional discount</p>
                            </button>
                            <button
                                onClick={() => {
                                    setTitle('🚗 New Service Available!');
                                    setMessage('We now offer premium detailing services. Book your appointment today and make your car shine!');
                                }}
                                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition text-sm"
                            >
                                <p className="font-semibold text-slate-900">New Service</p>
                                <p className="text-xs text-slate-600">Feature announcement</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
