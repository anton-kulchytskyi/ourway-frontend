import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import { hasLocale, type Locale } from "./dictionaries";
import { notFound } from "next/navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "OurWay",
  description: "Family task manager",
  other: { "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes" },
};

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "uk" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${geist.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#f59e0b" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
