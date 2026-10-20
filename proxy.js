import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (pengganti middleware di Next.js 16) untuk memproteksi rute /admin.
 * Semua rute di bawah /admin (kecuali /admin/login) wajib login dengan Supabase Auth.
 * Jika belum login, pengunjung akan dialihkan ke /admin/login.
 */
export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  // Jika environment variable belum diatur dan mengakses rute terlindungi
  if (!supabaseUrl || !supabaseKey) {
    if (!isLoginPage) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Wajib login untuk semua rute /admin selain /admin/login
  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};

