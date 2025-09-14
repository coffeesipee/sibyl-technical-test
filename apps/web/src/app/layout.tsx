import Navbar from "@/components/common/Navbar"
import './globals.css'
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { cookies } from "next/headers"
import { CookieKey } from "@/lib/cookie"

export const metadata = {
  title: 'Mini Legal Marketplace',
  description: 'Sibyl technical test',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = (await cookies()).get(CookieKey.AUTH_TOKEN)?.value
  const role = (await cookies()).get(CookieKey.USER_ROLE)?.value

  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar isAuthenticated={Boolean(token)} role={role as string} />
          <Toaster />

          <main>
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  )
}
