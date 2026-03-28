'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/topbar/Topbar";
import Footer from "@/components/footer/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from 'next/navigation';
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "RailThailand | Thailand Train Schedules, Tickets & Travel Guide",
//   description:
//     "Comprehensive Thailand train schedules, real-time tracking, and booking. Find routes between cities, check train times, and book tickets for all major Thai railway routes including Bangkok, Chiang Mai, and more.",
//   keywords:
//     "Thailand trains, Thai railway, train schedule Thailand, book train tickets Thailand, Bangkok to Chiang Mai train, Thailand rail travel, SRT train times",
//   openGraph: {
//     title: "RailThailand | Thailand Train Schedules & Booking",
//     description:
//       "Your complete guide to train travel in Thailand. Check schedules, book tickets, and explore Thailand by rail.",
//     images: "/thai-train.jpg",
//     type: "website",
//     locale: "en_US",
//     url: "https://railthailand.com",
//     siteName: "RailThailand",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isStudio = pathname?.includes('/studio');
  const isBlogs = pathname?.includes('/blogs');

  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-V42947VP6R" />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Topbar />
        <Breadcrumb />

        <div
          className={`flex justify-between bg-[url('/snowflakes.png')] bg-center`}
        >
          {!isStudio && <div className="hidden md:block w-1/6 pt-36"></div>}
          <main className="flex-1">
            {!isBlogs && <p className="whitespace-nowrap text-end py-4 text-xs italic mr-4">
              Last Updated: 6th January, 2026
            </p>}
            
            {/* <div
              className="overflow-hidden w-full min-h-[430px] max-h-[430px] flex items-center justify-center"
            >
            </div> */}
            {children}
          </main>
          {!isStudio && <div className="hidden md:block w-1/6 pt-36 pl-8"></div>}
        </div>
        <Footer />
      </body>
    </html>
  );
}
