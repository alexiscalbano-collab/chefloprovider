import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    // Redirection selon le rôle
    if (path === '/dashboard') {
      if (token?.role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
      if (token?.role === 'livreur') return NextResponse.redirect(new URL('/livraison', req.url))
      if (token?.role === 'achat') return NextResponse.redirect(new URL('/achat', req.url))
      if (token?.role === 'manager') return NextResponse.redirect(new URL('/manager', req.url))
    }
    // Protection des routes admin
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Protection des routes manager
    if (path.startsWith('/manager') && !path.startsWith('/manager/login')) {
      if (token?.role !== 'manager' && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/manager/login', req.url))
      }
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path === '/login') return true
        if (path === '/manager/login') return true
        return !!token
      },
    },
  }
)
export const config = {
  matcher: ['/admin/:path*', '/livraison/:path*', '/achat/:path*', '/dashboard', '/manager/:path*'],
}
