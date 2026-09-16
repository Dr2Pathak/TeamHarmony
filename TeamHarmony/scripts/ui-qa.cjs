const { chromium, devices } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = path.join(__dirname, 'qa-screenshots')

const ROUTES = ['/', '/about', '/dashboard', '/teams', '/teacher', '/profile', '/login', '/register']
const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Teams', href: '/teams' },
  { label: 'Teacher', href: '/teacher' },
  { label: 'Profile', href: '/profile' },
  { label: 'About', href: '/about' },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const report = { base: BASE, timestamp: new Date().toISOString(), routes: [], navClicks: [], mobile: {}, verdict: 'SHIP' }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  for (const route of ROUTES) {
    const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(500)
    const status = res?.status() ?? 0
    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    await page.screenshot({ path: path.join(OUT, `desktop-${name}.png`), fullPage: true })
    report.routes.push({ route, status, ok: status === 200 })
    if (status !== 200) report.verdict = 'DO NOT SHIP'
  }

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  for (const item of NAV) {
    const link = page.locator(`header a[href="${item.href}"]`).filter({ hasText: item.label }).first()
    const visible = await link.isVisible()
    let ok = false
    if (visible) {
      await Promise.all([
        page.waitForURL((url) => {
          const p = url.pathname
          return item.href === '/' ? p === '/' : p === item.href || p.startsWith(item.href + '/')
        }, { timeout: 15000 }),
        link.click(),
      ])
      ok = true
    }
    report.navClicks.push({ ...item, visible, ok })
    if (!visible || !ok) report.verdict = 'SHIP WITH FIXES'
  }

  await context.close()

  const mobile = await browser.newContext({ ...devices['iPhone 13'] })
  const mpage = await mobile.newPage()
  await mpage.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await mpage.waitForTimeout(800)
  await mpage.screenshot({ path: path.join(OUT, 'mobile-home.png'), fullPage: true })

  const menu = mpage.getByRole('button', { name: 'Open menu' })
  const menuVisible = await menu.isVisible().catch(() => false)
  report.mobile.menuVisible = menuVisible
  if (menuVisible) {
    await menu.click()
    await mpage.waitForTimeout(500)
    const missing = []
    for (const item of NAV) {
      const found = await mpage.locator(`a[href="${item.href}"]`).filter({ hasText: item.label }).first().isVisible().catch(() => false)
      if (!found) missing.push(item.label)
    }
    report.mobile.missing = missing
    await mpage.screenshot({ path: path.join(OUT, 'mobile-menu.png') })
    if (missing.length) report.verdict = 'SHIP WITH FIXES'
  } else {
    report.verdict = 'SHIP WITH FIXES'
  }

  await mobile.close()
  await browser.close()
  fs.writeFileSync(path.join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
