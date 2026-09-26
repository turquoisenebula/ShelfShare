import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "ShelfShare",
  description: "A shared shelf for what you're reading and watching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="max-w-5xl mx-auto px-6 pb-24">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
