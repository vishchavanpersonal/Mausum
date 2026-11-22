import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "India Weather | 10-Day Forecast",
  description: "10-day weather forecasts for cities across India."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
