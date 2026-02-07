import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boundaries Coffee - Management Dashboard',
  description: 'Executive dashboard for Boundaries Coffee locations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50 dark:bg-gray-900">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
              <Sidebar />
            </div>
            
            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}