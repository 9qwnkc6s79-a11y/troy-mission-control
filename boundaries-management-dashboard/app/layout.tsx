'use client'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="en" className="h-full bg-gray-50 dark:bg-gray-900">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex h-screen">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="fixed inset-0 bg-gray-600/75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800">
                  <Sidebar />
                </div>
              </div>
            )}
            
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
              <Sidebar />
            </div>
            
            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}