import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report an issue",
  description: "Create a ticket quickly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
