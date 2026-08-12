import "./globals.css";

export const metadata = {
  title: "Box Office — Event Seat Booking",
  description: "Reserve seats for live events with a clean, real-time seat map.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-paper">{children}</body>
    </html>
  );
}
