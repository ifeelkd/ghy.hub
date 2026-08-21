import type { Metadata } from "next";
import { MarketplaceProvider } from "@/lib/store/marketplace-store";
import Navbar from "@/components/layout/Navbar";
import Toast from "@/components/ui/Toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Brief — Freelance work, verified",
  description:
    "Post projects. Apply with one profile. Review applicants in one place. Freelancers rate the clients they work with.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-wash" aria-hidden="true" />
        <MarketplaceProvider>
          <Navbar />
          <div className="view-container">{children}</div>
          <Toast />
        </MarketplaceProvider>
      </body>
    </html>
  );
}
