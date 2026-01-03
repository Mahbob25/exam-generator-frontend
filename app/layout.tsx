import type { Metadata } from "next";
import { Cairo } from "next/font/google"; // Using Cairo as requested for Arabic support
import "./globals.css";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ExamGen AI - Intelligent Question Generation",
  description: "Generate high-quality exam questions instantly with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cairo.variable} font-body antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
