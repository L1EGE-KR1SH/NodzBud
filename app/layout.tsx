import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NodzBud",
  description: "Your app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      layout:{
        logoImageUrl:'/icons/yoom-logo.svg'
      },
      variables:{
        colorText:'fff',
        colorInputText:'#fff',
        colorInputBackground:'#252a41',
        colorBackground:'#1c1f2e',
        colorPrimary:'#0E78F9'
      },

    }}>
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} bg-dark-2 antialiased`}>
          <Navbar />
          <main className="relative z-10 pt-20">
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}