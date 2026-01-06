import type { Metadata } from "next";
import { Cairo } from "next/font/google"; // Using Cairo as requested for Arabic support
import "@/styles/variables.css";
import "@/styles/animations.css";
import "./globals.css";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { GlobalFeedbackTrigger } from "@/components/shared/GlobalFeedbackTrigger";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ذاكر - منصة التعلم الذكي",
  description: "منصة ذاكر تساعدك على استيعاب المفاهيم بطريقة تفاعلية وشخصية، مع اختبارات ذكية وتجربة تعلم تتكيف مع مستواك.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-body antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <GlobalFeedbackTrigger />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
