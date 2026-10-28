import type { Metadata } from "next";
import "@fontsource-variable/rubik/wght.css";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Exodia 4.0 · Dashboard", template: "%s · Exodia 4.0" },
  description:
    "The Exodia organizer workspace. Registrations, learning stacks, payments and arrivals.",
  robots: { index: false, follow: false },
  icons: { icon: "/icons/favicon.svg" },
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
