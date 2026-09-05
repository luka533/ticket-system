// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import Link from "next/link";
// import { TicketCheck } from "lucide-react";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: {
//     template: "%s | Ticket System",
//     default: "Ticket System",
//   },
//   description: "App for managing tickets and assets",
// };

// export default function RootLayout({ children }: LayoutProps<"/">) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">
//         <div className="flex min-h-svh flex-1 flex-col bg-muted/30">
//           <header className="border-b bg-background">
//             <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
//               <Link
//                 href="/"
//                 className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               >
//                 <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
//                   <TicketCheck className="size-4" aria-hidden="true" />
//                 </span>
//                 <span className="flex flex-col leading-none">
//                   <span className="text-sm font-semibold tracking-tight">
//                     Ticket System
//                   </span>
//                   <span className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
//                     IT service workspace
//                   </span>
//                 </span>
//               </Link>
//             </div>
//           </header>

//           <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
//             {children}
//           </main>

//           <footer className="border-t bg-background">
//             <div className="mx-auto flex min-h-12 w-full max-w-6xl items-center justify-center px-4 py-3 text-center text-xs text-muted-foreground sm:px-6">
//               Only authorized employees have access to Ticket System.
//             </div>
//           </footer>
//         </div>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Ticket System",
    default: "Ticket System",
  },
  description: "App for managing tickets and assets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
