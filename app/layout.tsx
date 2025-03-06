import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/hooks/use-web3"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UAE T-Bond Platform",
  description: "A platform for UAE Treasury Bonds on Unichain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}

