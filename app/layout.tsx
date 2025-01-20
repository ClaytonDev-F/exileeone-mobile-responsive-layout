import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import Web3ModalProvider from "@/context"; // Verifique se este é o provider correto

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StartupX",
  description: "tokenizing the world"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let cookie = null;

  try {
    const headersInstance = await headers();
    cookie = headersInstance.get("cookie") || null;
  } catch (error) {
    console.error("Error fetching headers:", error);
  }

  return (
    <html lang="en">
      <body>
        {/* Passando diretamente o cookie como string ou null */}
        <Web3ModalProvider cookies={cookie}>{children}</Web3ModalProvider>
      </body>
    </html>
  );
}
