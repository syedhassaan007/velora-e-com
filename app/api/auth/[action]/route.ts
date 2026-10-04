import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const reg = z.object({ name: z.string().min(2).max(60), email: z.string().email(), password: z.string().min(8).max(100) });
const log = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request, { params }: { params: { action: string } }) {
  if (params.action === "logout") { cookies().delete("session"); return NextResponse.json({ ok: true }); }
  const body = await req.json().catch(() => null);
  if (params.action === "register") {
    const p = reg.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "Check your details (password needs 8+ characters)." }, { status: 400 });
    const email = p.data.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    // Role is never accepted from the client; self-registration is always USER.
    const u = await db.user.create({ data: { name: p.data.name, email, password: await bcrypt.hash(p.data.password, 12) } });
    await createSession(u.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  if (params.action === "login") {
    const p = log.safeParse(body);
    const u = p.success ? await db.user.findUnique({ where: { email: p.data.email.toLowerCase() } }) : null;
    // Same message for unknown email and bad password to avoid account enumeration.
    if (!p.success || !u || !(await bcrypt.compare(p.data.password, u.password))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    await createSession(u.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
