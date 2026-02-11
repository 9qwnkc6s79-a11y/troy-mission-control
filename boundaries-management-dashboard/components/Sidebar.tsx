'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Menu,
  Banknote,
  Megaphone,
  Settings,
  BarChart3
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Menu', href: '/menu', icon: Menu },
  { name: 'Finance', href: '/finance', icon: Banknote },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto bg-white dark:bg-gray-800 shadow-lg">
        {/* Logo */}
        <div className="boundaries-gradient px-6 py-6">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <div className="ml-3 text-white">
              <h2 className="text-lg font-semibold">Boundaries</h2>
              <p className="text-xs text-white/80">Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? 'bg-boundaries-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <item.icon
                  className={clsx(
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                    'mr-3 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Boundaries Coffee Management
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}