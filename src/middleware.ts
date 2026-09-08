import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/giris") ||
    path.startsWith("/ogretmen-kayit") ||
    path.startsWith("/ogrenci-kayit") ||
    path.startsWith("/sifremi-unuttum") ||
    path.startsWith("/sifre-belirle") ||
    path.startsWith("/hakkinda");

  // Girişi olmayan kullanıcı korumalı sayfaya giremez
  if (!user && !isAuthPage && path !== "/") {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, is_admin")
      .eq("id", user.id)
      .single();

    // Admin sayfalarını sadece adminler görebilir
    if (path.startsWith("/admin") && !profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Onaysız öğretmenler, onay bekliyor sayfasına yönlendirilir
    if (
      profile?.role === "teacher" &&
      !isAuthPage &&
      path !== "/onay-bekliyor" &&
      path !== "/"
    ) {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("approved")
        .eq("id", user.id)
        .single();

      if (teacher && teacher.approved === false) {
        return NextResponse.redirect(new URL("/onay-bekliyor", request.url));
      }
    }

    // Onaylanmış öğretmen, onay bekliyor sayfasında kalmasın
    if (profile?.role === "teacher" && path === "/onay-bekliyor") {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("approved")
        .eq("id", user.id)
        .single();
      if (teacher?.approved === true) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
