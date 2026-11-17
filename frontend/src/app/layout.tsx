import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import AppHeader from "@/components/app-header/app-header";
import AppFooter from "@/components/app-footer/app-footer";
import BottomNav from "@/components/bottom-nav/bottom-nav";
import { getCurrentUser } from "@/lib/waypet-api";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "WayPet Home",
  description: "Plataforma para centralizar reportes de mascotas perdidas y encontradas.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className={poppins.className}>
        <AppHeader user={user} />
        {children}
        <AppFooter />
        {user && <BottomNav />}
      </body>
    </html>
  );
}