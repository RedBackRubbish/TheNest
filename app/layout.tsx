import type { Metadata, Viewport } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Nest | Sovereign AI Governance",
  description: "Command center for the Synthetic Civilization. Where Dragons deliberate and The Elder governs.",
  keywords: ["AI governance", "autonomous systems", "sovereign engineering"],
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
