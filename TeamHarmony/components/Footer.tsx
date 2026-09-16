import Link from 'next/link'

const productLinks = [
  { href: '/teams', label: 'Teams' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/teacher', label: 'Teacher' },
  { href: '/profile', label: 'Profile' },
]

const companyLinks = [
  { href: '/about', label: 'About' },
  { href: '/register', label: 'Get started' },
  { href: '/login', label: 'Sign in' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/80 bg-card/70">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-display text-sm font-semibold">TH</span>
              </div>
              <span className="font-display text-lg font-semibold">TeamHarmony</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Stability-aware team formation that helps people collaborate with clarity, balance, and trust.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-foreground">Product</h3>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-foreground">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border/80 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {currentYear} TeamHarmony. All rights reserved.</p>
          <p className="text-xs sm:text-sm">Built for educators and collaborative teams.</p>
        </div>
      </div>
    </footer>
  )
}
