'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Teams', href: '/teams' },
  { label: 'Teacher', href: '/teacher' },
  { label: 'Profile', href: '/profile' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-[1.03]">
            <span className="font-display text-sm font-semibold tracking-tight">TH</span>
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            TeamHarmony
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && currentUser ? (
            <>
              <div className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:block">
                {currentUser.name}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm" className="rounded-full px-4">
                  Sign up
                </Button>
              </Link>
            </>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border bg-card">
              <div className="mt-8 space-y-2">
                <p className="mb-4 font-display text-xl font-semibold">TeamHarmony</p>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link href="/register" onClick={() => setIsOpen(false)} className="block pt-4">
                    <Button className="w-full rounded-full">Sign up</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
