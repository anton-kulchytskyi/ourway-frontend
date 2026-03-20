import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import { hasLocale, type Locale } from "./dictionaries";
import { notFound } from "next/navigation";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "OurWay",
  description: "Family task manager",
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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
