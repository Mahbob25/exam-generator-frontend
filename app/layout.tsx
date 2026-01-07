import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "ذاكر - منصة التعلم الذكي",
  description: "منصة ذاكر تساعدك على استيعاب المفاهيم بطريقة تفاعلية وشخصية، مع اختبارات ذكية وتجربة تعلم تتكيف مع مستواك.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ذاكر",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
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
