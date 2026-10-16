import { cookies } from "next/headers";
import { checkPassword, isAuthed, SESSION_COOKIE, sessionToken } from "@/lib/admin";

export async function GET() {
  return Response.json({ authed: await isAuthed() });
}

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !checkPassword(password)) {
    // Deneme-yanılmayı yavaşlatmak için kısa bekleme
    await new Promise((r) => setTimeout(r, 1000));
    return Response.json({ error: "Şifre yanlış" }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
