import "./globals.css";

export const metadata = {
  title: "Ycle",
  description:
    "Ycle is a platform for recording cycles and connecting with others.",
  openGraph: {
    title: "Ycle - Record Your Cycles",
    description: "Connect and share your cycles with others on Ycle",
    url: "https://why-mvn.vercel.app",
    siteName: "Ycle",
    images: [
      {
        url: "https://why-mvn.vercel.app/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">{children}</div>
      </body>
    </html>
  );
}
