import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const {
      data: { user: foundUser },
    } = await supabase.auth.getUser()
    user = foundUser
  } catch (error) {
    console.error("Middleware auth error:", error)
    // If auth fails, we treat it as no user, preventing 500 crash
  }

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith("/manager")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith("/matches")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith("/areas")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith("/player")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Auth routes (redirect to dashboard if logged in)
  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/manager/:path*",
    "/matches/:path*",
    "/areas/:path*",
    "/player/:path*",
  ],
}
