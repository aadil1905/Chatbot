import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { clinicBrand } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${clinicBrand.doctorName} | ${clinicBrand.clinicName}`,
  description: `${clinicBrand.clinicName} dashboard and chatbot for ${clinicBrand.address}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
