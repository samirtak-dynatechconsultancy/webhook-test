import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Webhook Listener",
  description: "Live Azure DevOps webhook event viewer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
