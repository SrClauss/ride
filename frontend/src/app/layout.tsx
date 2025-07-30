import type { Metadata } from "next";
import { AppProvider } from "../store/context";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import MainLayout from "../components/layout/MainLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rider Finance",
  description: "Sistema de gestão financeira pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProvider>
          <ThemeProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
