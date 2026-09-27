import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

// Protegge il pannello /admin: senza una sessione valida si viene mandati
// alla pagina di login. Le Server Actions del pannello ricontrollano
// comunque la sessione (vedi src/lib/admin-actions.ts).
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  const ok = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
