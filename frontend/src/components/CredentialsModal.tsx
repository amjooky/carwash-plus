'use client';

import { useState } from 'react';
import { X, Copy, Check, Download, AlertTriangle } from 'lucide-react';

interface OwnerCredentials {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    message: string;
}

interface CredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentials: OwnerCredentials;
    centerName: string;
}

export default function CredentialsModal({ isOpen, onClose, credentials, centerName }: CredentialsModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const downloadCredentials = () => {
        const content = `
CarWash+ Owner Account Credentials
===================================

Center: ${centerName}
Owner Name: ${credentials.firstName} ${credentials.lastName}
Email: ${credentials.email}
Username: ${credentials.username}
Password: ${credentials.password}

IMPORTANT: Please change your password after first login.
These credentials will not be shown again.

Generated: ${new Date().toLocaleString()}
    `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${credentials.username}_credentials.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Owner Account Created</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-slate-100 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Warning Banner */}
                <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">Important!</p>
                        <p className="text-sm text-amber-800 mt-1">
                            {credentials.message}
                        </p>
                    </div>
                </div>

                {/* Center Info */}
                <div className="mb-4 rounded-lg bg-purple-50 p-4">
                    <p className="text-sm font-semibold text-purple-900">Center</p>
                    <p className="text-lg font-bold text-purple-700">{centerName}</p>
                </div>

                {/* Credentials */}
                <div className="space-y-3">
                    {/* Owner Name */}
                    {(credentials.firstName || credentials.lastName) && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Owner Name
                            </label>
                            <div className="rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2">
                                <p className="text-slate-900 font-medium">
                                    {credentials.firstName} {credentials.lastName}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Email
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2">
                                <p className="text-slate-900 font-mono">{credentials.email}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(credentials.email, 'email')}
                                className="rounded-lg bg-slate-200 px-3 hover:bg-slate-300 transition"
                                title="Copy email"
                            >
                                {copiedField === 'email' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Copy className="h-5 w-5 text-slate-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Username
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2">
                                <p className="text-slate-900 font-mono">{credentials.username}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(credentials.username, 'username')}
                                className="rounded-lg bg-slate-200 px-3 hover:bg-slate-300 transition"
                                title="Copy username"
                            >
                                {copiedField === 'username' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Copy className="h-5 w-5 text-slate-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-2">
                                <p className="text-green-900 font-mono font-bold">{credentials.password}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(credentials.password, 'password')}
                                className="rounded-lg bg-green-200 px-3 hover:bg-green-300 transition"
                                title="Copy password"
                            >
                                {copiedField === 'password' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Copy className="h-5 w-5 text-green-700" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={downloadCredentials}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-purple-600 px-4 py-3 font-semibold text-purple-600 hover:bg-purple-50 transition"
                    >
                        <Download className="h-5 w-5" />
                        Download
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        Done
                    </button>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-slate-500">
                    Share these credentials securely with the center owner
                </p>
            </div>
        </div>
    );
}
