import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
};
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  cookies().set("session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function getUser() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    // Role is read from the DB on every request so demotions take effect immediately.
    return await db.user.findUnique({ where: { id: String(payload.sub) }, select: { id: true, name: true, email: true, role: true } });
  } catch { return null; }
}
export async function requireUser() { const u = await getUser(); if (!u) redirect("/login"); return u; }
export async function requireAdmin() { const u = await requireUser(); if (u.role !== "ADMIN") redirect("/"); return u; }
