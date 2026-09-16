import type { Metadata, Viewport } from 'next'
import { Fraunces, Outfit, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/context/auth-context'
import { TeamProvider } from '@/context/team-context'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TeamHarmony - Build Harmonious Teams',
  description:
    'Form teams with personality-matched members and achieve optimal team dynamics through data-driven insights.',
  keywords: ['team formation', 'personality assessment', 'team stability', 'workplace harmony'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef3f6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f171d' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${outfit.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <TeamProvider>
            {children}
            <Toaster />
          </TeamProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
