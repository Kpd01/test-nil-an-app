import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Birthday App",
  description: "A simple birthday reminder app.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
