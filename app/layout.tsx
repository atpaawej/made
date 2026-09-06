import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landing POC",
  description: "Chat-based landing page builder POC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
