"use client";

import { useState, useEffect } from "react";
import IndexKnowledgeForm from "@/components/IndexKnowledgeForm";

export default function IndexKnowledgePage() {
    const [apiKey, setApiKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    // Validate API key against backend
    const validateApiKey = async (key: string): Promise<boolean> => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_BASE_URL}/meta`, {
                headers: { "X-API-Key": key },
            });

            if (response.ok) {
                return true;
            } else if (response.status === 403) {
                setError("❌ مفتاح API غير صحيح. الرجاء التحقق من المفتاح والمحاولة مرة أخرى.");
                return false;
            } else {
                setError("فشل التحقق من مفتاح API");
                return false;
            }
        } catch (err) {
            console.error("API key validation error:", err);
            setError("خطأ في الاتصال بالخادم");
            return false;
        }
    };

    const handleAuthenticate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!apiKey || apiKey.trim().length === 0) {
            setError("يرجى إدخال مفتاح API");
            return;
        }

        setIsValidating(true);

        // Validate the API key against the backend
        const isValid = await validateApiKey(apiKey);

        setIsValidating(false);

        if (isValid) {
            // Store API key in session storage
            if (typeof window !== "undefined") {
                sessionStorage.setItem("admin_api_key", apiKey);
            }
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("admin_api_key");
        }
        setApiKey("");
        setIsAuthenticated(false);
    };

    // Check if already authenticated on mount (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedKey = sessionStorage.getItem("admin_api_key");
            if (storedKey) {
                setApiKey(storedKey);
                // Validate the stored key
                validateApiKey(storedKey).then((isValid) => {
                    if (isValid) {
                        setIsAuthenticated(true);
                    }
                });
            }
        }
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔐 لوحة التحكم</h1>
                        <p className="text-gray-600">فهرسة المحتوى التعليمي</p>
                    </div>

                    <form onSubmit={handleAuthenticate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                مفتاح API
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="أدخل مفتاح API"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isValidating}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isValidating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>جاري التحقق...</span>
                                </>
                            ) : (
                                "دخول"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                            <strong>ملاحظة:</strong> يتم حفظ مفتاح API في جلسة المتصفح فقط ولن يُحفظ بشكل دائم.
                            سيتم التحقق من صحة المفتاح قبل السماح بالدخول.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📚 فهرسة المحتوى</h1>
                        <p className="text-gray-600 mt-1">إضافة محتوى تعليمي جديد للنظام</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                        تسجيل الخروج
                    </button>
                </div>

                {/* Info Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 كيفية الاستخدام</h2>
                    <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                        <li>اختر الصف الدراسي والمادة</li>
                        <li>أدخل عنوان الدرس</li>
                        <li>الصق النص الكامل للمحتوى (على الأقل 100 حرف)</li>
                        <li>اضغط "فهرسة المحتوى" وانتظر اكتمال العملية</li>
                        <li>سيتم معالجة المحتوى تلقائياً وإضافته لقاعدة البيانات</li>
                    </ul>
                </div>

                {/* Form Component */}
                <IndexKnowledgeForm apiKey={apiKey} />

                {/* Footer Info */}
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 text-center">
                        <strong>ملاحظة:</strong> عملية الفهرسة قد تستغرق عدة دقائق حسب حجم المحتوى.
                        سيتم تحليل النص، استخراج المفاهيم، وبناء قاعدة البيانات المتجهة تلقائياً.
                    </p>
                </div>
            </div>
        </div>
    );
}
