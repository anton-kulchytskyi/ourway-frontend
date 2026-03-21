import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import { hasLocale, type Locale } from "./dictionaries";
import { notFound } from "next/navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const BASE_URL = "https://ourway-frontend.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "OurWay — Family Task Manager",
    template: "%s | OurWay",
  },
  description:
    "Family Kanban board with Telegram bot and gamification for kids. Manage tasks together — parents, kids, everyone.",
  keywords: ["family task manager", "kanban", "telegram bot", "kids gamification", "family planner"],
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "OurWay",
    title: "OurWay — Family Task Manager",
    description:
      "Family Kanban board with Telegram bot and gamification for kids.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OurWay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OurWay — Family Task Manager",
    description:
      "Family Kanban board with Telegram bot and gamification for kids.",
    images: ["/og-image.png"],
  },
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
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
